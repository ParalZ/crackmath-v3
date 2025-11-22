import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LessonContent from "@/components/LessonContent"; // <--- Import it

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string; lessonSlug: string };
}) {
  const { courseSlug, segmentSlug, lessonSlug } = await params;

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return notFound();

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Navigation */}
      <div className="mb-6 flex gap-2 text-sm text-neutral-400">
        <Link
          href={`/courses/${courseSlug}/${segmentSlug}`}
          className="hover:text-white"
        >
          &larr; Back to Segment
        </Link>
      </div>

      <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">
        {lesson.title}
      </h1>

      {/* DELETED: Video Section */}

      {/* NEW: Math/Text Renderer */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10">
        <LessonContent content={lesson.content} />
      </div>
    </div>
  );
}
