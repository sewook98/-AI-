// ✅ /app/api/score/route.ts
let scores: { name: string; score: number; date: string }[] = [];

export async function POST(req: Request) {
  const { name, score } = await req.json();
  if (!name || typeof score !== "number") {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }
  scores.push({ name, score, date: new Date().toISOString() });
  return Response.json({ success: true });
}

export async function GET() {
  const sorted = [...scores].sort((a, b) => b.score - a.score).slice(0, 10);
  return Response.json(sorted);
}