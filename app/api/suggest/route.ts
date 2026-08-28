import { NextResponse } from "next/server";
import { addSuggestion } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
  const text = (body.text ?? "").trim().slice(0, 160);
  if (text.length < 3) return NextResponse.json({ error: "too short" }, { status: 400 });
  await addSuggestion(text);
  return NextResponse.json({ ok: true });
}
