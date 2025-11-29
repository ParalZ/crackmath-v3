"use client";

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
  let borderColor = "border-neutral-700";

  if (disabled) {
    if (status === "correct") borderColor = "border-green-500";
    else if (status === "incorrect") borderColor = "border-red-500";
  }

  return (
    <div className="w-full">
      <input
        type="text"
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !disabled) onEnter();
        }}
        placeholder="Type your answer..."
        className={`w-full rounded-xl border bg-neutral-950 px-6 py-4 text-lg text-white outline-none focus:border-blue-500 ${borderColor}`}
      />
    </div>
  );
}
