import Link from "next/link";

interface LessonItemProps {
  title: string;
  link: string;
  index: number;
  isLocked?: boolean;
  isCompleted?: boolean; // <--- NEW PROP
}

export default function LessonItem({
  title,
  link,
  index,
  isLocked,
  isCompleted,
}: LessonItemProps) {
  // Logic: Completed items get a specific style
  const isDone = isCompleted && !isLocked;

  return (
    <div
      className={`group relative flex items-center rounded-xl border p-4 transition-all ${
        isLocked
          ? "border-neutral-800 bg-neutral-900/50 opacity-75"
          : isDone
            ? "border-green-900/50 bg-green-900/10 hover:border-green-700" // Green style
            : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-600 hover:bg-neutral-800"
      }`}
    >
      {/* Number Badge */}
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
          isLocked
            ? "bg-neutral-800 text-neutral-500"
            : isDone
              ? "bg-green-600 text-white" // Green Badge
              : "bg-blue-600 text-white"
        }`}
      >
        {index}
      </div>

      {/* Text Info */}
      <div className="ml-4 flex-1">
        <h3
          className={`font-medium ${
            isLocked
              ? "text-neutral-500"
              : isDone
                ? "text-green-400"
                : "text-white"
          }`}
        >
          {title}
        </h3>
        {isLocked && (
          <p className="text-xs text-neutral-600">Premium Content</p>
        )}
        {/* Optional: Add "Completed" text */}
        {isDone && <p className="text-xs text-green-600">Ukończone</p>}
      </div>

      {/* Action / Lock Icon */}
      <div className="ml-4">
        {isLocked ? (
          <span className="text-xl">🔒</span>
        ) : (
          <span
            className={`text-xl transition-transform group-hover:translate-x-1 ${
              isDone ? "text-green-500" : "text-neutral-500"
            }`}
          >
            &rarr;
          </span>
        )}
      </div>

      <Link href={link} className="absolute inset-0" />
    </div>
  );
}
