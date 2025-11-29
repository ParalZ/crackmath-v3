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
  console.log("🚀 Action: completeLesson started for:", lessonId); // LOG 1

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("❌ Error: No user logged in."); // LOG 2
    return;
  }

  console.log("👤 User found:", user.id); // LOG 3

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
    console.error("❌ DB Error:", error.message, error.details); // LOG 4
    return;
  }

  console.log("✅ Success! Lesson marked complete."); // LOG 5
  revalidatePath(`/courses/${courseSlug}/${segmentSlug}`);
}

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
