"use client";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Props = {
  options: string[];
  // We accept null/undefined here to handle loading states safely
  value: string | number | null | undefined;
  onChange: (val: number) => void;
  disabled: boolean;
  correctAnswer: any;
  isAnswered: boolean;
};

export function SingleChoiceQuestion({
  options,
  value,
  onChange,
  disabled,
  correctAnswer,
  isAnswered,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        // --- FIXED LOGIC ---
        // 1. Check type: Only allow strict strings or numbers.
        //    This filters out null, undefined, and empty arrays [] which all convert to 0.
        // 2. Check empty: Ensure it's not an empty string "".
        const isPrimitive =
          typeof value === "string" || typeof value === "number";
        const isSelected =
          isPrimitive && value !== "" && Number(value) === index;

        const isCorrectIndex = Number(correctAnswer) === index;

        let className = "rounded-xl border px-6 py-4 text-left transition-all ";

        if (isAnswered) {
          if (isCorrectIndex) {
            // Green for Correct
            className += "border-green-500 bg-green-500/10";
          } else if (isSelected) {
            // Red for Wrong (only if explicitly selected)
            className += "border-red-500 bg-red-500/10";
          } else {
            // Grey/Dim for others
            className += "border-neutral-800 opacity-50";
          }
        } else {
          if (isSelected) {
            className += "border-blue-500 bg-blue-500/10 text-white";
          } else {
            className += "border-neutral-700 hover:bg-neutral-800";
          }
        }

        return (
          <button
            key={index}
            disabled={disabled}
            onClick={() => onChange(index)}
            className={className}
          >
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {option}
            </Markdown>
          </button>
        );
      })}
    </div>
  );
}
