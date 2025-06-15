"use client";

export const dynamic = "force-dynamic"; // 이 줄을 추가하세요

import { Suspense } from "react";
import GameContent from "./GameContent";

export default function GamePage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <GameContent />
    </Suspense>
  );
}
