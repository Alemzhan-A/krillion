import { NextResponse } from "next/server";
import { gameDate, isPastDate } from "@/lib/day";
import { getPack } from "@/lib/packs";
import { answerSheet } from "@/lib/sheet";

export const dynamic = "force-dynamic";

/**
 * Лист ответов за прошедшие дни. Сегодняшний день не отдаём: пока он идёт,
 * это был бы готовый ответник. Свой лист игрок получает в ответе
 * /api/today/complete и хранит локально.
 */
export function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  const pack = getPack(url.searchParams.get("pack"));

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "bad date" }, { status: 400 });
  }
  if (!isPastDate(date)) {
    return NextResponse.json(
      { error: "лист ответов открывается после окончания дня", today: gameDate() },
      { status: 403 },
    );
  }
  return NextResponse.json({ date, pack: pack.id, sheet: answerSheet(date, pack.id) });
}
