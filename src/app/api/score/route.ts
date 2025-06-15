// src/app/api/score/route.ts
import { NextResponse } from "next/server";

// ✅ 'let' → 'const'로 수정 (scores는 reassigned 되지 않음)
const scores: { name: string; score: number; date: string }[] = [];

export async function POST(req: Request) {
  const { name, score } = await req.json();

  if (!name || typeof score !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  scores.push({
    name,
    score,
    date: new Date().toISOString(),
  });

  scores.sort((a, b) => b.score - a.score);
  const topScores = scores.slice(0, 10);

  return NextResponse.json({ success: true, scores: topScores });
}

export async function GET() {
  return NextResponse.json(scores);
}
