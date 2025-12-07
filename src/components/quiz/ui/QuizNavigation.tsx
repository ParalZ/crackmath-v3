import { QuestionStatus } from "../types";

type Props = {
  total: number;
  current: number;
  history: QuestionStatus[];
  onNavigate: (index: number) => void;
};

export const QuizNavigation = ({
  total,
  current,
  history,
  onNavigate,
}: Props) => {
  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {Array.from({ length: total }).map((_, idx) => {
        const status = history[idx];
        const isActive = idx === current;
        let color = "bg-neutral-800 text-neutral-400 border-neutral-700";

        if (status === "correct")
          color = "bg-green-900/50 text-green-400 border-green-800";
        if (status === "incorrect")
          color = "bg-red-900/50 text-red-400 border-red-800";

        return (
          <button
            key={idx}
            onClick={() => onNavigate(idx)}
            className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all hover:bg-neutral-700 ${color} ${
              isActive ? "ring-2 ring-white" : ""
            }`}
          >
            {idx + 1}
          </button>
        );
      })}
    </div>
  );
};
