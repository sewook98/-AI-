"use client";

export const dynamic = "force-dynamic"; // 이 줄을 추가하세요

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { glossary } from "@/lib/glossary";

interface Brick {
  id: number;
  label: string;
  broken: boolean;
}

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const unit = searchParams.get("unit") || "총칙";
  const scoreParam = parseInt(searchParams.get("score") || "0", 10);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ball = useRef({ x: 150, y: 200, dx: 1.5, dy: -1.5, radius: 7 });
  const paddle = useRef({ x: 120, width: 60, height: 10 });
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Math.min((scoreParam + 1) * 10, 60));
  const [gameEnded, setGameEnded] = useState(false);
  const [needRefill, setNeedRefill] = useState(false);

  const bonusTerms = glossary[unit] || [];

  const refillBricks = () => {
    const terms = Array.from(new Set([...(glossary[unit] || []), "건축", "구조", "신고", "허가", "지구", "건폐율"]));
    const shuffled = terms.sort(() => 0.5 - Math.random());
    const nextBricks: Brick[] = shuffled.slice(0, 12).map((label, idx) => ({
      id: idx,
      label,
      broken: false,
    }));
    setBricks(nextBricks);
  };

  useEffect(() => {
    refillBricks();
  }, [unit]);

  useEffect(() => {
    if (needRefill && !gameEnded) {
      refillBricks();
      setNeedRefill(false);
    }
  }, [needRefill, gameEnded]);

  useEffect(() => {
    if (gameEnded) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameEnded(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameEnded]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw bricks
      bricks.forEach((brick, i) => {
        if (!brick.broken) {
          const row = Math.floor(i / 4);
          const col = i % 4;
          const x = col * 80 + 10;
          const y = row * 30 + 30;
          ctx.fillStyle = bonusTerms.includes(brick.label) ? "#c6f6d5" : "#ddd";
          ctx.fillRect(x, y, 70, 20);
          ctx.fillStyle = "#333";
          ctx.font = "10px sans-serif";
          ctx.fillText(brick.label, x + 5, y + 14);
        }
      });

      // Draw ball
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, ball.current.radius, 0, Math.PI * 2);
      ctx.fillStyle = "#3182ce";
      ctx.fill();
      ctx.closePath();

      // Draw paddle
      ctx.fillStyle = "#4a5568";
      ctx.fillRect(paddle.current.x, canvas.height - paddle.current.height - 10, paddle.current.width, paddle.current.height);
    };

    const moveBall = () => {
      const b = ball.current;
      b.x += b.dx;
      b.y += b.dy;

      // 벽 반사
      if (b.x < b.radius || b.x > canvas.width - b.radius) b.dx *= -1;
      if (b.y < b.radius) b.dy *= -1;

      // 패들 반사
      if (
        b.y + b.radius >= canvas.height - paddle.current.height - 10 &&
        b.x >= paddle.current.x &&
        b.x <= paddle.current.x + paddle.current.width
      ) {
        b.dy *= -1;
      }

      // 바닥에 떨어짐
      if (b.y > canvas.height) {
        setTimeLeft((prev) => Math.max(prev - 10, 0));
        b.x = 150;
        b.y = 200;
        b.dx = 1.5;
        b.dy = -1.5;
      }

      // 벽돌 충돌
      let hit = false;
      const newBricks = bricks.map((brick, i) => {
        if (brick.broken) return brick;
        const row = Math.floor(i / 4);
        const col = i % 4;
        const x = col * 80 + 10;
        const y = row * 30 + 30;
        if (
          b.x > x &&
          b.x < x + 70 &&
          b.y > y &&
          b.y < y + 20
        ) {
          b.dy *= -1;
          hit = true;
          if (bonusTerms.includes(brick.label)) {
            setTimeLeft((prev) => Math.min(prev + 3, 99));
          }
          return { ...brick, broken: true };
        }
        return brick;
      });

      if (hit) {
        setBricks(newBricks);
        const newScore = totalScore + 1;
        setTotalScore(newScore);
        if (newScore >= 30) setGameEnded(true);
        if (newBricks.every((b) => b.broken)) setNeedRefill(true);
      }

      draw();
    };

    let animationId: number;
    const loop = () => {
      if (!gameEnded) {
        moveBall();
        animationId = requestAnimationFrame(loop);
      }
    };
    loop();

    return () => cancelAnimationFrame(animationId);
  }, [bricks, gameEnded, totalScore]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    paddle.current.x = Math.max(0, Math.min(canvas.width - paddle.current.width, x - paddle.current.width / 2));
  };

  const handleSubmit = async () => {
    const name = prompt("이름을 입력하세요")?.trim();
    if (!name) return;
    await fetch("/api/game-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, timeLeft }),
    });
    router.push("/game/leaderboard");
  };

  return (
    <main className="p-4 space-y-4 text-center">
      <h1 className="text-2xl font-bold">🎾 벽돌깨기 게임</h1>
      <p className="text-sm text-gray-600">점수: {totalScore} / 30 | 남은 시간: {timeLeft}초</p>

      <canvas
        ref={canvasRef}
        width={360}
        height={300}
        onMouseMove={handleMouseMove}
        className="border mx-auto"
      />

      {gameEnded && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">🎉 게임 클리어!</h2>
          <p>남은 시간: {timeLeft}초</p>
          <Button onClick={handleSubmit}>리더보드에 등록</Button>
        </div>
      )}
    </main>
  );
}
