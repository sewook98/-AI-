// src/app/quiz/page.tsx
"use client";

import { Suspense } from "react";
import QuizPageContent from "./QuizPageContent";
export default function QuizPage() {
  return (
    <Suspense fallback={<p>로딩 중...</p>}>
      <QuizPageContent />
    </Suspense>
  );
}
