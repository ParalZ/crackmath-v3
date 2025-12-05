import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import LessonContent from "@/components/LessonContent";
import QuizInterface from "@/components/QuizInterface";
import CompleteAndNextButton from "@/components/CompleteAndNextButton";
import Breadcrumbs from "@/components/Breadcrumbs";

export default async function LessonPage({
  params,
}: {
  params: { courseSlug: string; segmentSlug: string; lessonSlug: string };
}) {
  const { courseSlug, segmentSlug, lessonSlug } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select(
      `*,
      segments(title),
      courses(title)
      `,
    )
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: nextLesson } = await supabase
    .from("lessons")
    .select("slug")
    .eq("segment_id", lesson.segment_id)
    .gt("order_index", lesson.order_index)
    .order("order_index", { ascending: true })
    .limit(1)
    .single();

  const isLocked = !lesson.is_free_preview && !user;
  if (isLocked) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 text-6xl">🔒</div>
        <h1 className="mb-4 text-3xl font-bold text-white">Content Locked</h1>
        <p className="mb-8 text-lg text-neutral-400">
          This lesson is part of our premium curriculum. <br />
          Please log in to continue your progress.
        </p>
        <Link
          href="/login"
          className="rounded-full bg-blue-600 px-10 py-4 font-bold text-white transition hover:scale-105 hover:bg-blue-500"
        >
          Log in to Access
        </Link>
      </div>
    );
  }

  const segmentLabel = lesson.segments.title;
  const courseLabel = lesson.courses.title;

  const breadcrumbs = [
    { label: "CrackMath", href: "/" },
    { label: courseLabel, href: `/courses/${courseSlug}` },
    { label: segmentLabel, href: `/courses/${courseSlug}/${segmentSlug}` },
    { label: lesson.title, href: "#", active: true },
  ];

  const nextUrl = nextLesson
    ? `/courses/${courseSlug}/${segmentSlug}/${nextLesson.slug}`
    : `/courses/${courseSlug}/${segmentSlug}`;

  // --- SCENARIO A: PRACTICE PAGE ---
  if (lesson.type === "practice") {
    // A. Get Questions
    const { data: questions } = await supabase
      .from("questions")
      .select("*")
      .eq("lesson_id", lesson.id)
      .order("order_index", { ascending: true });

    const safeQuestions = questions || [];

    // B. Get User Progress (Which questions are already correct?)
    let completedQuestionIds: string[] = [];

    if (user && safeQuestions.length > 0) {
      const questionIds = safeQuestions.map((q) => q.id);

      const { data: userProgress } = await supabase
        .from("user_progress")
        .select("question_id")
        .in("question_id", questionIds)
        .eq("user_id", user.id)
        .eq("is_correct", true);

      if (userProgress) {
        completedQuestionIds = userProgress.map((p) => p.question_id);
      }
    }

    return (
      <div className="mx-auto max-w-5xl px-6 py-10">
        <Breadcrumbs items={breadcrumbs} />
        <h1 className="mb-8 text-3xl font-bold text-white">{lesson.title}</h1>

        <QuizInterface
          questions={safeQuestions}
          nextUrl={nextUrl}
          lessonId={lesson.id}
          courseSlug={courseSlug}
          segmentSlug={segmentSlug}
          completedQuestionIds={completedQuestionIds} // <--- PASSING THE DATA
        />
      </div>
    );
  }

  // --- SCENARIO B: THEORY PAGE ---
  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <Breadcrumbs items={breadcrumbs} />
      <h1 className="mb-8 text-4xl font-bold tracking-tight text-white">
        {lesson.title}
      </h1>

      {lesson.video_url && (
        <div className="mb-10 aspect-video w-full overflow-hidden rounded-2xl border border-neutral-800 bg-black">
          <iframe
            src={lesson.video_url}
            className="h-full w-full"
            allowFullScreen
          />
        </div>
      )}

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-10">
        <LessonContent content={lesson.content} />
      </div>

      <div className="mt-12 flex justify-end">
        <CompleteAndNextButton
          lessonId={lesson.id}
          courseSlug={courseSlug}
          segmentSlug={segmentSlug}
          nextUrl={nextUrl}
        />
      </div>
    </div>
  );
}
