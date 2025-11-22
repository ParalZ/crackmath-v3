import ModuleCard from "@/components/ModuleCard";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function HomePage() {
  // Fetch Courses
  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

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
            // Link to the Course Page
            link={`/courses/${course.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
