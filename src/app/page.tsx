"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const units = [
  "총칙",
  "건축물의 건축",
  "건축물의 대지와 도로",
  "건축물의 유지와 관리",
  "건축물의 구조 및 재료",
  "건축설비",
  "용도지역 및 용도지구 안의 건축물",
  "특별건축구역",
  "보칙",
  "벌칙",
];

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="p-6 space-y-6 text-center">
      <h1 className="text-2xl font-bold">📘 단원을 선택하세요</h1>
      <p className="text-gray-600 text-sm">건축과법 공부 화이팅입니다! 💪</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto">
        {units.map((unit) => (
          <div key={unit} className="flex flex-col space-y-2">
            <Link href={`/learn/${encodeURIComponent(unit)}`}>
              <Button variant="outline">📖 {unit} 공부자료 보기</Button>
            </Link>
            <Link href={`/quiz?unit=${encodeURIComponent(unit)}`}>
              <Button>📝 {unit} 퀴즈 풀기</Button>
            </Link>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-8">
  이 건축과법 자료는 임호균 교수님의 건축과법 수업 자료를 이용했습니다.<br />
  모든 저작권은 연세대학교 임호균 교수님한테 있습니다.
</p>

    </main>
  );
}
