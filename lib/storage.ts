import type { TierId } from "./tiers";
import type { AnswerSheet } from "./sheet";

export const ANSWER_MS = 25_000;
export const PREVIEW_MS = 3_000;

const PLAYER_KEY = "krillion:player:v1";
const MUTED_KEY = "krillion:muted";
/** ключи разведены по режимам: у каждого пака своя партия и своя статистика */
const gameKey = (pack: string) => `krillion:game:v2:${pack}`;
const statsKey = (pack: string) => `krillion:stats:v2:${pack}`;

function read<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* приватный режим — просто не сохраняем */
  }
}

export type RoundResult = {
  promptId: string;
  promptText: string;
  /** канонический ответ; null — промах */
  answer: string | null;
  /** что игрок ввёл на самом деле (для промахов) */
  rawAnswer: string | null;
  tier: TierId | null;
  score: number;
  quip: string;
};

export type SavedGame = {
  date: string;
  pack: string;
  dayNumber: number;
  phase: "intro" | "preview" | "answer" | "done";
  roundIndex: number;
  results: RoundResult[];
  score: number;
  previewEndsAt: number | null;
  answerEndsAt: number | null;
  /** лист ответов дня — приходит с сервера, когда погружение закончено */
  sheet?: AnswerSheet;
};

export function loadGame(date: string, pack: string): SavedGame | null {
  const g = read<SavedGame>(gameKey(pack));
  return g && g.date === date ? g : null;
}

export function saveGame(game: SavedGame): void {
  write(gameKey(game.pack), game);
}

export function clearGame(pack: string): void {
  try {
    window.localStorage.removeItem(gameKey(pack));
  } catch {
    /* пусто */
  }
}

export type Stats = {
  gamesPlayed: number;
  totalScore: number;
  bestScore: number;
  currentStreak: number;
  maxStreak: number;
  lastPlayedDate: string | null;
  history: Record<string, { score: number; results: RoundResult[] }>;
};

const EMPTY_STATS: Stats = {
  gamesPlayed: 0,
  totalScore: 0,
  bestScore: 0,
  currentStreak: 0,
  maxStreak: 0,
  lastPlayedDate: null,
  history: {},
};

export function loadStats(pack: string): Stats {
  return read<Stats>(statsKey(pack)) ?? EMPTY_STATS;
}

function yesterdayOf(date: string): string {
  return new Date(Date.parse(`${date}T00:00:00Z`) - 86_400_000)
    .toISOString()
    .slice(0, 10);
}

export function recordFinishedDay(
  date: string,
  pack: string,
  score: number,
  results: RoundResult[],
): Stats {
  const stats = loadStats(pack);
  if (stats.history[date]) return stats;

  const streak =
    stats.lastPlayedDate === yesterdayOf(date) ? stats.currentStreak + 1 : 1;

  const next: Stats = {
    gamesPlayed: stats.gamesPlayed + 1,
    totalScore: stats.totalScore + score,
    bestScore: Math.max(stats.bestScore, score),
    currentStreak: streak,
    maxStreak: Math.max(stats.maxStreak, streak),
    lastPlayedDate: date,
    history: { ...stats.history, [date]: { score, results } },
  };
  write(statsKey(pack), next);
  return next;
}

export function getPlayerId(): string {
  const existing = read<string>(PLAYER_KEY);
  if (existing) return existing;
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `p-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  write(PLAYER_KEY, id);
  return id;
}

export function loadMuted(): boolean {
  try {
    return window.localStorage.getItem(MUTED_KEY) === "1";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    window.localStorage.setItem(MUTED_KEY, muted ? "1" : "0");
  } catch {
    /* пусто */
  }
}
