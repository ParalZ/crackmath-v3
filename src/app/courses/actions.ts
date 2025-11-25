"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Marks a lesson (theory or practice) as fully complete.
 * This is called when the user finishes all questions in a quiz
 * or clicks "Next" on a theory page.
 */
export async function completeLesson(
  lessonId: string,
  courseSlug: string,
  segmentSlug: string,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // Upsert = Update if exists, Insert if new
  const { error } = await supabase.from("lesson_progress").upsert(
    {
      user_id: user.id,
      lesson_id: lessonId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id, lesson_id" },
  );

  if (error) {
    console.error("Error completing lesson:", error);
    return;
  }

  // This tells Next.js to refresh the course page data
  // so the green checkmarks appear immediately without a page reload.
  revalidatePath(`/courses/${courseSlug}/${segmentSlug}`);
}

/**
 * Records a specific question as being answered correctly.
 * This allows us to track granular progress or show "You got this right before" later.
 */
export async function recordCorrectAnswer(questionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase.from("user_progress").upsert(
    {
      user_id: user.id,
      question_id: questionId,
      is_correct: true,
      created_at: new Date().toISOString(),
    },
    { onConflict: "user_id, question_id" },
  );

  if (error) {
    console.error("Error recording answer:", error);
  }
}
