/**
 * Проверка банка вопросов: дубликаты, конфликты нечёткого совпадения,
 * покрытие тиров. Запуск: npm run check:data
 */
import { PACKS } from "../lib/packs";
import { normalize } from "../lib/match";
import { TIER_IDS, type TierId } from "../lib/tiers";

let problems = 0;

function fail(msg: string) {
  console.error("  ✗ " + msg);
  problems++;
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
}

/** тот же допуск, что и в lib/match.ts */
const limitFor = (k: string) => (k.length >= 8 ? 2 : k.length >= 5 ? 1 : 0);

const seenIds = new Set<string>();
const ALL = PACKS.flatMap((p) => p.prompts.map((q) => ({ pack: p.id, prompt: q })));

for (const { pack, prompt } of ALL) {
  console.log(`\n[${pack}] ${prompt.id} — ${prompt.text}`);

  if (seenIds.has(prompt.id)) fail(`повторяющийся id вопроса: ${prompt.id}`);
  seenIds.add(prompt.id);

  // ——— канонические имена не должны повторяться
  const names = new Map<string, number>();
  for (const a of prompt.answers) names.set(a.n, (names.get(a.n) ?? 0) + 1);
  for (const [n, count] of names) if (count > 1) fail(`ответ «${n}» встречается ${count} раза`);

  // ——— все ключи (имена + синонимы) уникальны
  const keys = new Map<string, string>();
  for (const a of prompt.answers) {
    for (const form of [a.n, ...(a.a ?? [])]) {
      const key = normalize(form);
      if (!key) {
        fail(`пустой ключ у «${a.n}»`);
        continue;
      }
      const owner = keys.get(key);
      if (owner && owner !== a.n) fail(`ключ «${key}» делят «${owner}» и «${a.n}»`);
      keys.set(key, a.n);
    }
  }

  // ——— нечёткое совпадение не должно путать разные ответы
  const entries = [...keys.entries()];
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const [k1, n1] = entries[i];
      const [k2, n2] = entries[j];
      if (n1 === n2) continue;
      const limit = Math.max(limitFor(k1), limitFor(k2));
      if (limit && levenshtein(k1, k2) <= limit) {
        // точный ввод всё равно попадёт куда надо, а неоднозначную
        // опечатку матчер теперь отклоняет — это предупреждение, не ошибка
        console.log(`  · близкие ключи: «${n1}» ↔ «${n2}» (${k1} / ${k2})`);
      }
    }
  }

  // ——— каждый тир представлен, иначе шкала рвётся
  const byTier = new Map<TierId, number>();
  for (const a of prompt.answers) byTier.set(a.t, (byTier.get(a.t) ?? 0) + 1);
  for (const t of TIER_IDS) {
    if (!byTier.get(t)) fail(`нет ни одного ответа тира «${t}»`);
  }

  const counts = TIER_IDS.map((t) => `${t}:${byTier.get(t) ?? 0}`).join("  ");
  console.log(`  ${prompt.answers.length} ответов · ${counts}`);

  if (!prompt.exhaustive && prompt.answers.length < 20) {
    fail(`всего ${prompt.answers.length} ответов — слишком узкий банк`);
  }
}

for (const p of PACKS) {
  if (p.prompts.length < 7) fail(`в режиме «${p.name}» меньше семи вопросов`);
}

console.log(
  problems === 0
    ? `\n✓ Банк в порядке: ${PACKS.length} режима, ${ALL.length} вопросов, ` +
        `${ALL.reduce((n, x) => n + x.prompt.answers.length, 0)} ответов`
    : `\n✗ Проблем: ${problems}`,
);

process.exit(problems === 0 ? 0 : 1);
