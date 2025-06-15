"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  choices: string[];
  correctIndex: number;
}

export default function QuizPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const unit = searchParams.get("unit") || "";

  const router = useRouter();

  const fetchQuestion = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unit }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ 문제 요청 실패:", errText);
        return;
      }

      const data = await res.json();
      if (
        data?.question &&
        Array.isArray(data.choices) &&
        typeof data.correctIndex === "number"
      ) {
        setQuestions((prev) => [...prev, data]);
      }
    } catch (err) {
      console.error("❌ 문제 로딩 중 오류", err);
    }
    setLoading(false);
  };

  const question = questions[current];

  useEffect(() => {
    fetchQuestion();
  }, []);

  useEffect(() => {
    if (!question || showAnswer || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAnswer(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [question, showAnswer, loading]);

  const handleAnswer = (choiceIndex: number | null) => {
    if (selected !== null) return;
    setSelected(choiceIndex);
    setShowAnswer(true);
    if (choiceIndex === question?.correctIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = async () => {
    const next = current + 1;

    if (next >= 5) {
      setShowScore(true);
      return;
    }

    if (questions.length <= next) {
      await fetchQuestion();
    }

    setCurrent(next);
    setSelected(null);
    setShowAnswer(false);
    setTimeLeft(15);
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-xl text-center">
        <CardContent className="p-6 space-y-6">
          {showScore ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">🎉 최종 점수: {score} / 5</h2>
              <Button
                onClick={() => router.push(`/game?unit=${unit}&score=${score}`)}
              >
                게임하기
              </Button>
            </div>
          ) : loading && !question ? (
            <p className="text-gray-400">문제를 불러오는 중입니다...</p>
          ) : (
            <div className="space-y-4">
              <h1 className="text-xl font-bold">🏛 {unit} 퀴즈</h1>
              <Progress value={(current + 1) * 20} className="h-2" />
              <p className="text-gray-500 text-sm">{current + 1} / 5 문제</p>
              <p className="text-gray-700 text-sm">⏱ 남은 시간: {timeLeft}s</p>
              {question && (
                <>
                  <p className="font-semibold mb-4">{question.question}</p>
                  <div className="space-y-2">
                    {question.choices.map((choice, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        onClick={() => handleAnswer(i)}
                        disabled={showAnswer}
                        className={
                          showAnswer
                            ? i === question.correctIndex
                              ? "border-green-500 text-green-600"
                              : selected === i
                              ? "border-red-500 text-red-600"
                              : ""
                            : ""
                        }
                      >
                        {choice}
                      </Button>
                    ))}
                  </div>
                  {showAnswer && (
                    <div className="mt-4">
                      <p className="text-sm">
                        정답: {question.choices[question.correctIndex]}
                      </p>
                      <Button className="mt-2" onClick={handleNext}>
                        다음 문제
                      </Button>
                    </div>
                  )}
                </>
              )}
              {!question && !loading && (
                <p className="text-gray-400">문제를 불러올 수 없습니다. 다시 시도해주세요.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
