// app/page.tsx
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import ModuleCard from "@/components/ModuleCard";
import { ArrowRight, BookOpen, Star, Zap } from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Supabase Error:", error);
  }

  if (courses) {
    const course = courses[0];

    return (
      <div className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6">
        <div className="relative z-10 mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
            </span>
            Dostępny
          </div>

          {/* Title */}
          <h1 className="mb-6 text-6xl font-extrabold tracking-tight text-white md:text-7xl">
            CrackMath <br />
            <span className="bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {course.title}
            </span>
          </h1>

          {/* Description */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-neutral-400">
            {course.description ||
              "Dive deep into our comprehensive curriculum designed to take you from beginner to expert. Start your journey today."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/courses/${course.slug}`}
              className="group flex items-center gap-2 rounded-full bg-white px-8 py-4 font-bold text-black transition hover:scale-105 hover:bg-neutral-200"
            >
              Zacznij naukę
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Feature highlights (Static for now, keeps page looking full) */}
          <div className="mt-16 grid grid-cols-1 gap-8 border-t border-neutral-800 pt-10 text-left sm:grid-cols-3 sm:text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-neutral-900 p-3 text-blue-400">
                <BookOpen className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">Działy zgodne z CKE</h3>
              <p className="text-sm text-neutral-500">
                Cały Materiał Krok po Kroku
              </p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-neutral-900 p-3 text-purple-400">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">Interaktywne zadania</h3>
              <p className="text-sm text-neutral-500">Wizualizacje wykresów</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <div className="rounded-lg bg-neutral-900 p-3 text-yellow-400">
                <Star className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">Śledzenie Postępów</h3>
              <p className="text-sm text-neutral-500">Monitoruj swój rozwój</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
