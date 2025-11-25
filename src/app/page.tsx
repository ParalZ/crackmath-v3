import ModuleCard from "@/components/ModuleCard";
import { createClient } from "@/utils/supabase/server";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Courses
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  // --- ADD THIS DEBUGGING BLOCK ---
  if (error) {
    console.error("Supabase Error:", error);
  } else {
    console.log("Courses found:", courses?.length);
  }
  // -------------------------------

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-5xl font-bold text-white">The Academy.</h1>
        <p className="text-xl text-neutral-400">Select a course to begin.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {courses?.map((course) => (
          <ModuleCard
            key={course.id}
            title={course.title}
            description={course.description || "Start this course"}
            link={`/courses/${course.slug}`}
          />
        ))}

        {/* Helper to see if map is running */}
        {(!courses || courses.length === 0) && (
          <div className="text-white">No courses found in database.</div>
        )}
      </div>
    </div>
  );
}
