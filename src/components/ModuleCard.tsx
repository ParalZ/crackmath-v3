import Link from "next/link";

interface ModuleCardProps {
  title: string;
  description: string;
  link: string;
}

export default function ModuleCard({
  title,
  description,
  link,
}: ModuleCardProps) {
  return (
    <Link
      href={link}
      className="group block rounded-lg border border-neutral-800 bg-neutral-900 p-8 transition-all duration-300 hover:border-neutral-600"
    >
      <h3 className="mb-3 text-xl font-semibold text-white group-hover:text-gray-200">
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-neutral-400">{description}</p>

      {/* Simple arrow that moves slightly on hover */}
      <div className="mt-6 text-sm font-medium text-white transition-transform group-hover:translate-x-1">
        Start Module &rarr;
      </div>
    </Link>
  );
}
