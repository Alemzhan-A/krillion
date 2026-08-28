import type { PromptDef } from "./prompts";
import { getPack, type PackId } from "./packs";
import { ROUNDS_PER_DAY } from "./tiers";

/** игровой день начинается в полночь по Москве */
export const GAME_TZ = "Europe/Moscow";

/** первый день «Криллиона» */
export const EPOCH = "2026-01-01";

const fmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: GAME_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** текущая игровая дата в формате YYYY-MM-DD */
export function gameDate(now: Date = new Date()): string {
  return fmt.format(now);
}

export function dayNumber(date: string): number {
  const ms = Date.parse(`${date}T00:00:00Z`) - Date.parse(`${EPOCH}T00:00:00Z`);
  return Math.floor(ms / 86_400_000) + 1;
}

/** момент, когда откроется следующее погружение (полночь МСК = 21:00 UTC) */
export function resetsAt(date: string): string {
  const next = new Date(Date.parse(`${date}T00:00:00Z`) + 86_400_000);
  const y = next.getUTCFullYear();
  const m = String(next.getUTCMonth() + 1).padStart(2, "0");
  const d = String(next.getUTCDate()).padStart(2, "0");
  return new Date(Date.parse(`${y}-${m}-${d}T00:00:00Z`) - 3 * 3600_000).toISOString();
}

/** дата в прошлом относительно текущего игрового дня */
export function isPastDate(date: string): boolean {
  return date < gameDate();
}

/** mulberry32 — маленький детерминированный ГПСЧ */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedFrom(date: string, pack: string): number {
  let h = 2166136261;
  for (const ch of `krillion:${pack}:${date}`) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** 7 вопросов дня — одинаковые для всех, детерминированные по дате и режиму */
export function promptsForDate(date: string, packId?: string | null): PromptDef[] {
  const pack = getPack(packId);
  const rand = rng(seedFrom(date, pack.id));
  const pool = [...pack.prompts];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, ROUNDS_PER_DAY);
}

export type { PackId };
