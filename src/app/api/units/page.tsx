// ✅ /app/units/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const units = [
  "건축물의 정의",
  "건축허가",
  "대지와 도로",
  "용도지역",
  "구조 및 재료",
];

export default function UnitPage() {
  const router = useRouter();
  return (
    <main className="p-6 space-y-4 text-center">
      <h1 className="text-2xl font-bold">단원을 선택하세요</h1>
      {units.map((unit) => (
        <Button
          key={unit}
          onClick={() => router.push(`/learn?unit=${encodeURIComponent(unit)}`)}
        >
          {unit}
        </Button>
      ))}
    </main>
  );
}
