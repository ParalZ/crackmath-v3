import Link from "next/link";
import { createClient } from "@/utils/supabase/server"; // <--- SECURE CLIENT
import { notFound } from "next/navigation";
import LessonItem from "@/components/LessonItem";

export default async function SegmentPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string };
}) {
  const { courseSlug, segmentSlug } = await params;
  const supabase = await createClient(); // <--- Initialize

  // 1. Get Segment Details
  const { data: segment } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segmentSlug)
    .single();

  if (!segment) return notFound();

  // 2. Get Lessons for this Segment
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, slug, order_index")
    .eq("segment_id", segment.id)
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <Link
        href={`/courses/${courseSlug}`}
        className="mb-8 block text-neutral-400 hover:text-white"
      >
        &larr; Back to Course
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-white">{segment.title}</h1>

      <div className="flex flex-col gap-4">
        {lessons?.map((lesson, index) => (
          <LessonItem
            key={lesson.id}
            link={`/courses/${courseSlug}/${segmentSlug}/${lesson.slug}`}
            title={lesson.title}
            index={index + 1}
          />
        ))}
      </div>
    </div>
  );
}
