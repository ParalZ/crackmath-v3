"use client";

import dynamic from "next/dynamic";

// 1. DYNAMIC IMPORT
// We import the wrapper dynamically with ssr: false.
// This prevents Next.js from trying to render the MathLive component on the server,
// which would cause a "window is not defined" error or hydration mismatch.
const MathFieldWrapper = dynamic(() => import("./MathFieldWrapper"), {
  ssr: false,
  // Optional: A loading skeleton while the heavy MathLive library loads
  loading: () => (
    <div className="h-[60px] w-full animate-pulse rounded-xl bg-neutral-900" />
  ),
});

type Props = {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
  disabled: boolean;
  status: "correct" | "incorrect" | "unanswered" | "partial";
};

export function OpenQuestion({
  value,
  onChange,
  onEnter,
  disabled,
  status,
}: Props) {
  // 2. STYLING LOGIC
  // We apply the border color to the container div
  let borderColor = "border-neutral-700";

  if (disabled) {
    if (status === "correct") {
      borderColor = "border-green-500 ring-1 ring-green-500 bg-green-900/10";
    } else if (status === "incorrect") {
      borderColor = "border-red-500 ring-1 ring-red-500 bg-red-900/10";
    } else {
      // Disabled but not checked (rare, but good fallback)
      borderColor = "border-neutral-800 opacity-50";
    }
  } else {
    // Normal state focus style logic is handled inside the wrapper or via CSS,
    // but we can set a default border here.
    borderColor = "border-neutral-700 hover:border-neutral-500";
  }

  return (
    <div className="w-full">
      {/* 3. CONTAINER DIV */}
      {/* We wrap the component to simulate the look of a standard input field (borders, rounding) */}
      <div
        className={`overflow-hidden rounded-xl border bg-neutral-950 ${borderColor} transition-colors duration-200`}
      >
        <MathFieldWrapper
          value={value}
          onChange={onChange}
          onEnter={onEnter}
          disabled={disabled}
        />
      </div>

      {/* Helper text */}
      {!disabled && (
        <p className="mt-2 text-xs text-neutral-500">
          Tip: You can type text (like "sin") or LaTeX codes (like "\sqrt").
        </p>
      )}
    </div>
  );
}
