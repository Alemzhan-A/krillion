import { promptsForDate } from "./day";
import { TIERS, type TierId } from "./tiers";

export type SheetAnswer = { n: string; t: TierId; score: number };
export type SheetEntry = { promptId: string; promptText: string; answers: SheetAnswer[] };
export type AnswerSheet = SheetEntry[];

/**
 * Полный лист ответов дня: что ещё принималось и сколько бы дали.
 * Отдаём только после того, как погружение закончено, — иначе это спойлер.
 */
export function answerSheet(date: string, packId?: string | null): AnswerSheet {
  return promptsForDate(date, packId).map((p) => ({
    promptId: p.id,
    promptText: p.text,
    answers: p.answers
      .map((a) => ({ n: a.n, t: a.t, score: TIERS[a.t].score }))
      .sort((x, y) => y.score - x.score || x.n.localeCompare(y.n, "ru")),
  }));
}
