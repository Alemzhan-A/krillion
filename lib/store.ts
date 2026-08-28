import { MAX_DAY_SCORE } from "./tiers";

/**
 * Хранилище результатов дня.
 *
 * Сейчас — в памяти процесса: на Vercel это значит, что счётчики живут
 * недолго и не общие для всех инстансов. Интерфейс намеренно узкий, чтобы
 * подменить его на KV/Postgres без изменений в остальном коде.
 */

export type DayStats = { plays: number; scores: number[] };

const days = new Map<string, DayStats>();
const seen = new Map<string, Set<string>>();

const keyOf = (date: string, pack: string) => `${pack}:${date}`;

function dayOf(date: string): DayStats {
  let d = days.get(date);
  if (!d) days.set(date, (d = { plays: 0, scores: [] }));
  return d;
}

/** записываем итог погружения; повторные отправки от того же игрока игнорируем */
export function recordScore(
  date: string,
  pack: string,
  playerId: string,
  score: number,
): void {
  const key = keyOf(date, pack);
  let players = seen.get(key);
  if (!players) seen.set(key, (players = new Set()));
  if (players.has(playerId)) return;
  players.add(playerId);
  const d = dayOf(key);
  d.plays += 1;
  d.scores.push(score);
}

export const DIST_BUCKETS = 7;
const BUCKET_SIZE = MAX_DAY_SCORE / DIST_BUCKETS;

export type DayComparison = {
  plays: number;
  /** доля игроков, которых ты обошёл, 0..100; null — сравнивать не с кем */
  betterThan: number | null;
  /** гистограмма по 7 корзинам по 100 очков; null — данных мало */
  dist: number[] | null;
};

export function compare(date: string, pack: string, score: number): DayComparison {
  const d = days.get(keyOf(date, pack));
  if (!d || d.plays === 0) return { plays: 0, betterThan: null, dist: null };

  const below = d.scores.filter((s) => s < score).length;
  const betterThan = Math.round((below / d.scores.length) * 100);

  // гистограмму показываем, только когда за ней стоят настоящие партии
  if (d.plays < 5) return { plays: d.plays, betterThan, dist: null };

  const dist = Array.from({ length: DIST_BUCKETS }, () => 0);
  for (const s of d.scores) {
    const i = Math.min(DIST_BUCKETS - 1, Math.floor(s / BUCKET_SIZE));
    dist[i] += 1;
  }
  return { plays: d.plays, betterThan, dist };
}

/** предложенные игроками вопросы — тоже в памяти, до перезапуска */
const suggestions: { text: string; at: number }[] = [];

export function addSuggestion(text: string): void {
  suggestions.push({ text, at: Date.now() });
  if (suggestions.length > 500) suggestions.shift();
}
