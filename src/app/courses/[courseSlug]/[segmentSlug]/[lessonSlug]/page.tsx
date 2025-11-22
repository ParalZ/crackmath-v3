import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

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
      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex gap-2 text-sm text-neutral-400">
        <Link href={`/courses/${courseSlug}`} className="hover:text-white">
          Course
        </Link>
        <span>/</span>
        <Link
          href={`/courses/${courseSlug}/${segmentSlug}`}
          className="hover:text-white"
        >
          Segment
        </Link>
      </div>

      <h1 className="mb-6 text-3xl font-bold text-white">{lesson.title}</h1>

      {/* Video and Content sections remain the same as your original code */}
      <div className="mb-8 flex aspect-video w-full items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-white">
        {lesson.video_url ? <p>Video Player Here</p> : <p>No Video</p>}
      </div>

      <div className="prose prose-invert lg:prose-xl">
        <p>{lesson.content}</p>
      </div>
    </div>
  );
}
