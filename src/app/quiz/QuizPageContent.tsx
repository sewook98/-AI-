"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface Question {
  question: string;
  choices: string[];
  correctIndex: number;
}

interface Score {
  name: string;
  score: number;
  date: string;
}

export default function QuizPageContent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [loading, setLoading] = useState(false);
  const [leaderboard, setLeaderboard] = useState<Score[]>([]);

  const searchParams = useSearchParams();
  const unit = searchParams.get("unit") || "";

  // ✅ useCallback으로 감싸서 useEffect 의존성 문제 해결
  const fetchQuestion = useCallback(async () => {
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
  }, [unit]);

  const question = questions[current];

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

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

  const handleAnswer = useCallback((choiceIndex: number | null) => {
    if (selected !== null) return;
    setSelected(choiceIndex);
    setShowAnswer(true);
    if (choiceIndex === question?.correctIndex) {
      setScore((prev) => prev + 1);
    }
  }, [selected, question]);

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

  const handleRestart = () => {
    setQuestions([]);
    setCurrent(0);
    setScore(0);
    setShowScore(false);
    setSelected(null);
    setShowAnswer(false);
    setHasSubmitted(false);
    fetchQuestion();
  };

  const handleSubmitScore = async () => {
    const name = prompt("이름을 입력하세요")?.trim();
    if (!name) return;

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, score }),
      });

      if (!res.ok) {
        console.error("점수 저장 실패:", await res.text());
        return;
      }

      const lbRes = await fetch("/api/score");
      if (lbRes.ok) {
        const data = await lbRes.json();
        setLeaderboard(data);
        setHasSubmitted(true);
      }
    } catch (err) {
      console.error("리더보드 불러오기 실패", err);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-xl text-center">
        <CardContent className="p-6 space-y-6">
          {showScore ? (
            <div>
              <h2 className="text-2xl font-bold mb-4">🎉 최종 점수: {score} / 5</h2>
              {hasSubmitted ? (
                <>
                  <h3 className="text-lg font-semibold mb-2">🏆 리더보드</h3>
                  <ul className="text-left text-sm space-y-1">
                    {leaderboard.map((entry, idx) => (
                      <li key={idx}>
                        {idx + 1}. {entry.name} - {entry.score}점 (
                        {new Date(entry.date).toLocaleDateString()} )
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <Button onClick={handleSubmitScore}>점수 등록하기</Button>
              )}
              <Button className="mt-4" onClick={handleRestart}>
                다시하기
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
