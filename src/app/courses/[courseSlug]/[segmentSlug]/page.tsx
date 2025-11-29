import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LessonItem from "@/components/LessonItem";
import Breadcrumbs from "@/components/Breadcrumbs";

// Helper Type for the Joined Query
type LessonWithProgress = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  is_free_preview: boolean;
  type: string;
  // Supabase returns an array for one-to-many or many-to-many joins
  lesson_progress: { is_completed: boolean }[];
};

export default async function SegmentPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string };
}) {
  // Next.js 15: await params
  const { courseSlug, segmentSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Fetch Segment Details
  const { data: segment } = await supabase
    .from("segments")
    .select("id, title")
    .eq("slug", segmentSlug)
    .single();

  if (!segment) return notFound();

  // 2. Fetch Lessons AND User Progress
  // We join 'lesson_progress'. RLS ensures we only get progress for the CURRENT user.
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select(
      `
      id, title, slug, order_index, is_free_preview, type,
      lesson_progress(is_completed)
    `,
    )
    .eq("segment_id", segment.id)
    .order("order_index", { ascending: true });

  // Cast the data to our type to fix TS warnings
  const lessons = rawLessons as unknown as LessonWithProgress[];

  const breadcrumbs = [
    { label: "CrackMath", href: "/" },
    { label: courseSlug, href: `/courses/${courseSlug}` },
    { label: segmentSlug, href: `/courses/${courseSlug}/${segmentSlug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mb-8 text-3xl font-bold text-white">{segment.title}</h1>

      <div className="flex flex-col gap-4">
        {lessons?.map((lesson, index) => {
          // LOGIC: Check if completed
          // Since lesson_progress is an array, check if it has any entries with is_completed: true
          const isCompleted =
            lesson.lesson_progress?.[0]?.is_completed === true;

          // LOGIC: Locked status
          // (You might want to unlock it if they have purchased the course later)
          const isLocked = !lesson.is_free_preview && !user;

          return (
            <LessonItem
              key={lesson.id}
              link={`/courses/${courseSlug}/${segmentSlug}/${lesson.slug}`}
              title={lesson.title}
              index={index + 1}
              isLocked={isLocked}
              isCompleted={isCompleted} // <--- Pass the new prop
            />
          );
        })}
      </div>
    </div>
  );
}
