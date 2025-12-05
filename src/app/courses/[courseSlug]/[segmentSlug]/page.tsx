import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LessonItem from "@/components/LessonItem";
import Breadcrumbs from "@/components/Breadcrumbs";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  is_free_preview: boolean;
  order_index: number;
  // This is optional (?) because it won't exist if the user isn't logged in
  lesson_progress?: { is_completed: boolean }[] | null;
}

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

  const { data: segment } = await supabase
    .from("segments")
    .select(`id, title, courses(title)`)
    .eq("slug", segmentSlug)
    .single();

  if (!segment) return notFound();
  //console.log(segment);

  const selectQuery = user ? `*,lesson_progress(is_completed)` : "*";
  //because we have RLS the user cannot see entries of other users that is why we do not have to filter on user id in lesson_progress
  const { data: rawLessons } = await supabase
    .from("lessons")
    .select(selectQuery)
    .eq("segment_id", segment.id)
    .order("order_index", { ascending: true });

  //typesript thinks courses is an array, but dynamically it is an object
  //when getting first item from array dynamically it shows undefined cause it is an object
  //but if we let it just take courses.title typescript will give an error.
  const courseData = Array.isArray(segment?.courses)
    ? segment.courses[0]
    : segment?.courses;
  const courseLabel = courseData?.title || "No Course Linked";

  const breadcrumbs = [
    { label: "CrackMath", href: "/" },
    { label: courseLabel, href: `/courses/${courseSlug}` },
    { label: segment.title, href: `/courses/${courseSlug}/${segmentSlug}` },
  ];
  //console.log(rawLessons);
  const lessons = rawLessons as unknown as LessonData[];
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Breadcrumbs items={breadcrumbs} />

      <h1 className="mb-8 text-3xl font-bold text-white">{segment.title}</h1>

      <div className="flex flex-col gap-4">
        {lessons?.map((lesson, index) => {
          //check if lesson progress exist and if it exist if it has first row (it cannot have more, just 1 row for completedness)
          const progress = lesson.lesson_progress && lesson.lesson_progress[0];
          const isCompleted = progress ? progress.is_completed : false;

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
