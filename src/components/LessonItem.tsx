import Link from "next/link";

interface LessonItemProps {
  link: string;
  title: string;
  index: number;
}

export default function LessonItem({ link, title, index }: LessonItemProps) {
  return (
    <Link
      href={link}
      className="group block flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-900 p-6 transition-colors hover:border-neutral-600"
    >
      <div>
        <span className="mr-3 text-xs tracking-wider text-neutral-500 uppercase">
          Lesson {index}
        </span>
        <span className="text-lg font-medium text-white transition-colors group-hover:text-blue-400">
          {title}
        </span>
      </div>
      <span className="text-neutral-600 transition-transform group-hover:translate-x-1">
        Play &rarr;
      </span>
    </Link>
  );
}
