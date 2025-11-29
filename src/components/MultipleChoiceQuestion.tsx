"use client";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Props = {
  options: string[];
  value: string[]; // Stores selected indices as strings e.g. ["0", "2"]
  onChange: (val: string[]) => void;
  disabled: boolean;
  correctAnswer: any[]; // DB might return [0, 2] or ["0", "2"]
  isAnswered: boolean;
};

export function MultipleChoiceQuestion({
  options,
  value,
  onChange,
  disabled,
  correctAnswer,
  isAnswered,
}: Props) {
  const toggleOption = (index: number) => {
    if (disabled) return;
    const strIndex = index.toString();

    if (value.includes(strIndex)) {
      onChange(value.filter((item) => item !== strIndex));
    } else {
      onChange([...value, strIndex]);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {options.map((option, index) => {
        const strIndex = index.toString();
        const isSelected = value.includes(strIndex);

        // Robust check: Compare numbers to handle DB returning strings or numbers
        const isActuallyCorrect = correctAnswer.some(
          (ans) => Number(ans) === index,
        );

        let containerClass =
          "flex items-center gap-4 rounded-xl border px-6 py-4 text-left transition-all ";

        if (isAnswered) {
          if (isActuallyCorrect) {
            containerClass += "border-green-500 bg-green-500/10";
          } else if (isSelected) {
            // Selected but wrong
            containerClass += "border-red-500 bg-red-500/10";
          } else {
            containerClass += "border-neutral-800 opacity-50";
          }
        } else {
          if (isSelected) {
            containerClass += "border-blue-500 bg-blue-500/10 text-white";
          } else {
            containerClass += "border-neutral-700 hover:bg-neutral-800";
          }
        }

        // LOGIC FIX:
        // If answered: Only show the checkmark if it is ACTUALLY correct.
        // (This removes the checkmark from red/incorrect boxes).
        // If not answered: Show checkmark if the user selected it.
        const showCheck = isAnswered ? isActuallyCorrect : isSelected;

        return (
          <button
            key={index} // Use index as key
            disabled={disabled}
            onClick={() => toggleOption(index)} // Pass index
            className={containerClass}
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded border ${
                showCheck
                  ? "border-transparent bg-current"
                  : "border-neutral-500"
              }`}
            >
              {showCheck && (
                <span className="text-xs font-bold text-black">✓</span>
              )}
            </div>
            <div className="flex-1">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {option}
              </Markdown>
            </div>
          </button>
        );
      })}
    </div>
  );
}
