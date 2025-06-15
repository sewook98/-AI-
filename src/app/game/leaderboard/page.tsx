"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface GameScore {
  name: string;
  timeLeft: number;
  date: string;
}

export default function GameLeaderboardPage() {
  const [scores, setScores] = useState<GameScore[]>([]);
  const router = useRouter();

  useEffect(() => {
  const fetchScores = async () => {
    const res = await fetch("/api/game-score", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setScores(data);
    }
  };
  fetchScores();
}, []);


  return (
    <main className="p-6 space-y-6 text-center">
      <h1 className="text-2xl font-bold">🏆 벽돌깨기 리더보드</h1>
      <ul className="space-y-2 text-sm max-w-md mx-auto">
        {scores.length === 0 ? (
          <p>등록된 점수가 없습니다.</p>
        ) : (
          scores.map((entry, idx) => (
            <li key={idx} className="border rounded p-2">
              {idx + 1}. {entry.name} - {entry.timeLeft}초 남김 (
              {new Date(entry.date).toLocaleDateString()})
            </li>
          ))
        )}
      </ul>
      <Button className="mt-4" onClick={() => router.push("/")}>홈으로 돌아가기</Button>
    </main>
  );
}
