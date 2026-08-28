import { NextResponse } from "next/server";
import { gameDate, dayNumber, resetsAt, promptsForDate } from "@/lib/day";
import { getPack } from "@/lib/packs";

export const dynamic = "force-dynamic";

export function GET(req: Request) {
  const packId = new URL(req.url).searchParams.get("pack");
  const pack = getPack(packId);
  const date = gameDate();
  return NextResponse.json({
    date,
    pack: pack.id,
    dayNumber: dayNumber(date),
    resetsAt: resetsAt(date),
    prompts: promptsForDate(date, pack.id).map((p) => ({
      id: p.id,
      text: p.text,
      placeholder: p.placeholder,
    })),
  });
}
