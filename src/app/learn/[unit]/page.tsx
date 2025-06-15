"use client";

import { useParams } from "next/navigation";

export default function LearnUnitPage() {
  const { unit } = useParams();

  const pdfFileName = decodeURIComponent(unit as string);
  const pdfUrl = `/pdfs/${pdfFileName}.pdf`;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-6 space-y-4">
      <h1 className="text-2xl font-bold">{pdfFileName} 자료</h1>
      <iframe
        src={pdfUrl}
        className="w-full max-w-4xl h-[80vh] border rounded"
      />
    </main>
  );
}