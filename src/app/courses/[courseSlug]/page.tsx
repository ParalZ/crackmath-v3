import ModuleCard from "@/components/ModuleCard";
import { createClient } from "@/utils/supabase/server"; // <--- SECURE CLIENT
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const { courseSlug } = await params;
  const supabase = await createClient(); // <--- Initialize

  // 1. Get the Course ID first
  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", courseSlug)
    .single();

  if (!course) return notFound();

  // 2. Get Segments for this Course
  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-16">
        <span className="text-sm tracking-wider text-neutral-500 uppercase">
          Course
        </span>
        <h1 className="mt-2 text-4xl font-bold text-white">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {segments?.map((segment) => (
          <ModuleCard
            key={segment.id}
            title={segment.title}
            description={segment.description || "View lessons"}
            link={`/courses/${courseSlug}/${segment.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
