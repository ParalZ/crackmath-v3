import Breadcrumbs from "@/components/Breadcrumbs";
import ModuleCard from "@/components/ModuleCard";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";

export default async function CoursePage({
  params,
}: {
  params: { courseSlug: string };
}) {
  const { courseSlug } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("slug", courseSlug)
    .single();

  if (!course) return notFound();

  const { data: segments } = await supabase
    .from("segments")
    .select("*")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });
  const breadcrumbs = [
    { label: "CrackMath", href: "/" },
    { label: courseSlug, href: `/courses/${courseSlug}` },
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mb-16">
        <span className="text-sm tracking-wider text-neutral-500 uppercase">
          Kurs
        </span>
        <h1 className="mt-2 text-4xl font-bold text-white">{course.title}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {segments?.map((segment) => (
          <ModuleCard
            key={segment.id}
            title={segment.title}
            description={segment.description || "Sprawdź lekcje"}
            link={`/courses/${courseSlug}/${segment.slug}`}
          />
        ))}
      </div>
    </div>
  );
}
