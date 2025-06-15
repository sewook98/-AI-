// src/app/quiz/page.tsx
"use client";

import { Suspense } from "react";
import QuizPageContent from "./QuizPageContent";

export default function QuizPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <QuizPageContent />
    </Suspense>
  );
}
