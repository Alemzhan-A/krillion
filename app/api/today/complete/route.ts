import { NextResponse } from "next/server";
import { gameDate } from "@/lib/day";
import { getPack } from "@/lib/packs";
import { answerSheet } from "@/lib/sheet";
import { compare, recordScore } from "@/lib/store";
import { MAX_DAY_SCORE } from "@/lib/tiers";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { date?: string; pack?: string; playerId?: string; score?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const pack = getPack(body.pack);
  const date = body.date ?? gameDate();
  const playerId = (body.playerId ?? "").slice(0, 64);
  const score = Number(body.score);
  if (!playerId || !Number.isFinite(score) || score < 0 || score > MAX_DAY_SCORE) {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  recordScore(date, pack.id, playerId, score);

  // погружение окончено — вот весь лист ответов, включая непойманное
  return NextResponse.json({
    ...compare(date, pack.id, score),
    sheet: answerSheet(date, pack.id),
  });
}
