"use client";

import { useRouter } from "next/navigation";
import { completeLesson } from "@/app/courses/actions"; // Server Action

export default function CompleteAndNextButton({
  lessonId,
  courseSlug,
  segmentSlug,
  nextUrl,
}: {
  lessonId: string;
  courseSlug: string;
  segmentSlug: string;
  nextUrl: string;
}) {
  const router = useRouter();

  const handleClick = async () => {
    // 1. Save progress to the database securely
    // We await this to ensure the Sidebar updates its green checkmarks immediately
    await completeLesson(lessonId, courseSlug, segmentSlug);

    // 2. Navigate to the next lesson (or practice page)
    router.push(nextUrl);
  };

  return (
    <button
      onClick={handleClick}
      className="rounded-full bg-white px-8 py-3 font-bold text-black transition hover:bg-neutral-200"
    >
      Następna Lekcja &rarr;
    </button>
  );
}
