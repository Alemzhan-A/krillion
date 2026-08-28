import { NextResponse } from "next/server";
import { gameDate, promptsForDate } from "@/lib/day";
import { getPack } from "@/lib/packs";
import { grade } from "@/lib/match";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { date?: string; pack?: string; promptId?: string; answer?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const pack = getPack(body.pack);
  const date = body.date ?? gameDate();
  const answer = (body.answer ?? "").slice(0, 80);
  const prompt = promptsForDate(date, pack.id).find((p) => p.id === body.promptId);
  if (!prompt) return NextResponse.json({ error: "unknown prompt" }, { status: 400 });

  const result = grade(prompt, answer);
  if (!result.ok) return NextResponse.json({ ok: false });

  return NextResponse.json({
    ok: true,
    answer: result.answer,
    tier: result.tier,
    score: result.score,
    quip: result.quip,
  });
}
