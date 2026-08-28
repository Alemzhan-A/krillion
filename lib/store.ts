import { Redis } from "@upstash/redis";
import { MAX_DAY_SCORE } from "./tiers";

/**
 * Результаты дня: сколько человек нырнуло и с каким счётом.
 *
 * Если в окружении есть Upstash Redis — считаем там, и статистика общая для
 * всех инстансов и переживает деплой. Если нет (локальная разработка, форк без
 * интеграции) — падаем в память процесса: игра работает, но проценты
 * показываются только внутри одного инстанса.
 */

const HIST_TTL = 60 * 60 * 24 * 45; // сорок пять дней, потом день можно забыть

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export const statsBackend = redis ? "redis" : "memory";

const histKey = (date: string, pack: string) => `krillion:v1:${pack}:${date}:hist`;
const playerKey = (date: string, pack: string, playerId: string) =>
  `krillion:v1:${pack}:${date}:p:${playerId}`;

/* ——— запасной вариант в памяти ————————————————— */

type MemDay = { hist: Map<number, number>; players: Set<string> };
const mem = new Map<string, MemDay>();

function memDay(key: string): MemDay {
  let d = mem.get(key);
  if (!d) mem.set(key, (d = { hist: new Map(), players: new Set() }));
  return d;
}

/* ——— запись ——————————————————————————————————— */

/** записываем итог погружения; повторные отправки того же игрока не считаем */
export async function recordScore(
  date: string,
  pack: string,
  playerId: string,
  score: number,
): Promise<void> {
  if (redis) {
    // NX: первая отправка выигрывает, повтор ничего не добавит
    const first = await redis.set(playerKey(date, pack, playerId), score, {
      nx: true,
      ex: HIST_TTL,
    });
    if (first === null) return;
    const key = histKey(date, pack);
    await redis.hincrby(key, String(score), 1);
    await redis.expire(key, HIST_TTL);
    return;
  }

  const d = memDay(`${pack}:${date}`);
  if (d.players.has(playerId)) return;
  d.players.add(playerId);
  d.hist.set(score, (d.hist.get(score) ?? 0) + 1);
}

/* ——— чтение ——————————————————————————————————— */

export const DIST_BUCKETS = 7;
const BUCKET_SIZE = MAX_DAY_SCORE / DIST_BUCKETS;

export type DayComparison = {
  /** сколько всего погружений сегодня в этом режиме */
  plays: number;
  /** доля остальных игроков, кого ты обошёл, 0..100; null — сравнивать не с кем */
  betterThan: number | null;
  /** место по счёту, 1 — лучший результат дня */
  rank: number | null;
  /** медиана дня */
  median: number | null;
  /** лучший результат дня */
  best: number | null;
  /** гистограмма по семи корзинам в сто очков; null — данных мало */
  dist: number[] | null;
  /** откуда взяты цифры: общая база или память инстанса */
  backend: "redis" | "memory";
};

const EMPTY: DayComparison = {
  plays: 0,
  betterThan: null,
  rank: null,
  median: null,
  best: null,
  dist: null,
  backend: statsBackend,
};

async function histogram(date: string, pack: string): Promise<Map<number, number>> {
  if (redis) {
    const raw = await redis.hgetall<Record<string, string | number>>(
      histKey(date, pack),
    );
    const hist = new Map<number, number>();
    for (const [k, v] of Object.entries(raw ?? {})) {
      const score = Number(k);
      const count = Number(v);
      if (Number.isFinite(score) && Number.isFinite(count) && count > 0) {
        hist.set(score, count);
      }
    }
    return hist;
  }
  return new Map(mem.get(`${pack}:${date}`)?.hist ?? []);
}

export async function compare(
  date: string,
  pack: string,
  score: number,
): Promise<DayComparison> {
  const hist = await histogram(date, pack);
  const plays = [...hist.values()].reduce((n, c) => n + c, 0);
  if (plays === 0) return EMPTY;

  let below = 0;
  let atOrAbove = 0;
  let best = 0;
  for (const [s, count] of hist) {
    if (s < score) below += count;
    else atOrAbove += count;
    if (s > best) best = s;
  }

  // сравниваем с остальными, себя из знаменателя убираем —
  // иначе «лучше 100%» недостижимо в принципе
  const others = plays - 1;
  const betterThan = others > 0 ? Math.round((below / others) * 100) : null;

  // ранг: сколько человек строго выше тебя, плюс один
  let above = 0;
  for (const [s, count] of hist) if (s > score) above += count;
  const rank = above + 1;

  // медиана по развёрнутой гистограмме
  const sorted = [...hist.entries()].sort((a, b) => a[0] - b[0]);
  let seen = 0;
  let median: number | null = null;
  const mid = Math.floor(plays / 2);
  for (const [s, count] of sorted) {
    seen += count;
    if (median === null && seen > mid) median = s;
  }

  let dist: number[] | null = null;
  if (plays >= 5) {
    dist = Array.from({ length: DIST_BUCKETS }, () => 0);
    for (const [s, count] of hist) {
      const i = Math.min(DIST_BUCKETS - 1, Math.floor(s / BUCKET_SIZE));
      dist[i] += count;
    }
  }

  return { plays, betterThan, rank, median, best, dist, backend: statsBackend };
}

/* ——— предложенные вопросы ————————————————————— */

const suggestions: { text: string; at: number }[] = [];

export async function addSuggestion(text: string): Promise<void> {
  if (redis) {
    await redis.lpush("krillion:v1:suggestions", JSON.stringify({ text, at: Date.now() }));
    await redis.ltrim("krillion:v1:suggestions", 0, 499);
    return;
  }
  suggestions.push({ text, at: Date.now() });
  if (suggestions.length > 500) suggestions.shift();
}
