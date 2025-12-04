import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LessonItem from "@/components/LessonItem";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function SegmentPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string };
}) {
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
  console.log(segment);

  //because we have RLS the user cannot see entries of other users that is why we do not have to filter on user id in lesson_progress
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select(`
      *,
      lesson_progress(is_completed)
      `)
    .eq("segment_id", segment.id)
    .order("order_index", { ascending: true });

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
        {rawLessons?.map((lesson, index) => {
          //check if lesson progress exist and if it exist if it has first row (it cannot have more, just 1 row for completedness)
          const progress = lesson.lesson_progress && lesson.lesson_progress[0];
          const isCompleted = progress ? progress : false;

          //logic for locking the lesson if someone is not logged in
          const isLocked = !lesson.is_free_preview && !user;

          return (
            <LessonItem
              key={lesson.id}
              link={`/courses/${courseSlug}/${segmentSlug}/${lesson.slug}`}
              title={lesson.title}
              index={index + 1}
              isLocked={isLocked}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>
    </div>
  );
}
