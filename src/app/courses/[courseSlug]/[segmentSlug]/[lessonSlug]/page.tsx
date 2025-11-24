import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import LessonContent from "@/components/LessonContent";
import QuizInterface from "@/components/QuizInterface";

export default async function GenericLessonPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string; lessonSlug: string };
}) {
  const { courseSlug, segmentSlug, lessonSlug } = await params;

  // 1. FETCH CURRENT LESSON (The "Unit")
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return notFound();

  // 2. FETCH NEXT LESSON (For navigation logic)
  // We need to find the lesson with the next highest order_index
  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("slug")
    .eq("segment_id", lesson.segment_id)
    .gt("order_index", lesson.order_index)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  // Determine URL for the "Next" button
  const nextUrl = nextLesson
    ? `/courses/${courseSlug}/${segmentSlug}/${nextLesson.slug}`
    : `/courses/${courseSlug}/${segmentSlug}`; // Or a "Congratulations" page

  // =========================================================
  // SCENARIO A: IT IS A PRACTICE PAGE
  // =========================================================
  if (lesson.type === "practice") {
    // Fetch questions linked to this lesson
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("order_index", { ascending: true });

    return (
      <div className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-4 text-sm text-neutral-400">Practice Mode</div>
        <h1 className="mb-8 text-3xl font-bold text-white">{lesson.title}</h1>

        {/* Render Client Quiz Component */}
        <QuizInterface questions={questions || []} nextUrl={nextUrl} />
      </div>
    );
  }

  // =========================================================
  // SCENARIO B: IT IS A THEORY PAGE
  // =========================================================
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      {/* Navigation Breadcrumb */}
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

      {/* Video (if any) */}
      {lesson.video_url && (
        <div className="mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black">
          <iframe
            src={lesson.video_url}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}

      {/* Text Content */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10">
        <LessonContent content={lesson.content} />
      </div>

      {/* Next Button for Theory Pages */}
      <div className="mt-12 flex justify-end">
        <Link
          href={nextUrl}
          className="rounded-full bg-white px-8 py-3 font-bold text-black hover:bg-neutral-200"
        >
          Next Step &rarr;
        </Link>
      </div>
    </div>
  );
}
