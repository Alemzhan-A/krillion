import type { AnswerDef, PromptDef } from "./prompts";
import { TIERS, type TierId } from "./tiers";

/** приводим ответ к сравнимому виду: строчные, без ё, без пунктуации */
export function normalize(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 2) return 3;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j] + 1,
        cur[j - 1] + 1,
        prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length];
}

type Index = { key: string; answer: AnswerDef }[];

/**
 * Ключ — сам объект вопроса, а не его id: одинаковый id может достаться
 * другому набору ответов (тематический пак, архив, правка данных),
 * и кэш по id молча отдавал бы чужой список.
 */
const indexCache = new WeakMap<PromptDef, Index>();

function indexFor(prompt: PromptDef): Index {
  const cached = indexCache.get(prompt);
  if (cached) return cached;
  const idx: Index = [];
  for (const answer of prompt.answers) {
    idx.push({ key: normalize(answer.n), answer });
    for (const alias of answer.a ?? []) idx.push({ key: normalize(alias), answer });
  }
  indexCache.set(prompt, idx);
  return idx;
}

export type Grade =
  | { ok: true; answer: string; tier: TierId; score: number; quip: string }
  | { ok: false };

/** оценка ответа: точное совпадение, затем допуск на одну-две опечатки */
export function grade(prompt: PromptDef, raw: string): Grade {
  const key = normalize(raw);
  if (!key) return { ok: false };
  const idx = indexFor(prompt);

  let hit = idx.find((e) => e.key === key)?.answer;

  if (!hit) {
    // опечатка: допускаем расстояние 1 для коротких и 2 для длинных ключей
    let best: { d: number; answer: AnswerDef } | null = null;
    let ambiguous = false;
    for (const entry of idx) {
      const limit = entry.key.length >= 8 ? 2 : entry.key.length >= 5 ? 1 : 0;
      if (!limit) continue;
      const d = levenshtein(key, entry.key);
      if (d > limit) continue;
      if (!best || d < best.d) {
        best = { d, answer: entry.answer };
        ambiguous = false;
      } else if (d === best.d && entry.answer.n !== best.answer.n) {
        // «туба» и «труба» одинаково близки — угадывать нечестно
        ambiguous = true;
      }
    }
    if (!ambiguous) hit = best?.answer;
  }

  if (!hit) return { ok: false };
  const tier = TIERS[hit.t];
  return { ok: true, answer: hit.n, tier: hit.t, score: tier.score, quip: tier.blurb };
}
