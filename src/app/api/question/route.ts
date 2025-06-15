// ✅ /app/api/question/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { unit } = await req.json();

    const chat = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "너는 건축법 전문 튜터야. 절대 말하지 말고 JSON만 출력해. 형식은 반드시 다음과 같아: { \"question\": \"...\", \"choices\": [\"...\"], \"correctIndex\": 0 }",
        },
        {
          role: "user",
          content: `단원: ${unit}. 이 단원에서 객관식 4지선다 문제 하나를 만들어줘. 반드시 JSON만 출력하고 다른 말은 하지 마.`,
        },
      ],
      temperature: 0.7,
    });

    const content = chat.choices[0].message.content || "";
    console.log("📦 GPT 응답:", content);

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (
      parsed &&
      typeof parsed.question === "string" &&
      Array.isArray(parsed.choices) &&
      typeof parsed.correctIndex === "number"
    ) {
      return NextResponse.json(parsed);
    } else {
      return NextResponse.json({ error: "형식 오류" }, { status: 400 });
    }
  } catch (err) {
    console.error("❌ OpenAI API 오류:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}








