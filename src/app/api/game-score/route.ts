import { NextResponse } from "next/server";

let gameScores: { name: string; timeLeft: number; date: string }[] = [];

export async function POST(req: Request) {
  const { name, timeLeft } = await req.json();

  if (!name || typeof timeLeft !== "number") {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  gameScores.push({
    name,
    timeLeft,
    date: new Date().toISOString(),
  });

  // 점수 높은 순 정렬 + 상위 10개 유지
  gameScores.sort((a, b) => b.timeLeft - a.timeLeft);
  gameScores = gameScores.slice(0, 10);

  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json(gameScores);
}
