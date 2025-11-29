import Link from "next/link";
import { Fragment } from "react";

type Crumb = {
  label: string;
  href: string;
  active?: boolean;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="mb-8 flex items-center gap-2 text-sm text-neutral-400">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={item.href}>
            {/* Separator (Don't show for first item) */}
            {index > 0 && <span className="text-neutral-600">/</span>}

            {isLast || item.active ? (
              // Current Page (Not Clickable, White)
              <span className="line-clamp-1 max-w-[200px] font-medium text-white">
                {item.label}
              </span>
            ) : (
              // Previous Page (Clickable Link)
              <Link
                href={item.href}
                className="whitespace-nowrap transition-colors hover:text-white hover:underline"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
