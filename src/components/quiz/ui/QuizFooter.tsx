import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Question, QuestionStatus } from "../types";

type Props = {
  isAnswered: boolean;
  isLastQuestion: boolean;
  currentStatus: QuestionStatus;
  hint: string | null;
  explanation: string | null;
  showHint: boolean;
  stats: {
    correctCount: number;
    totalQuestions: number;
    isPassed: boolean;
  };
  onCheck: () => void;
  onNext: () => void;
};

export const QuizFooter = ({
  isAnswered,
  isLastQuestion,
  currentStatus,
  hint,
  explanation,
  showHint,
  stats,
  onCheck,
  onNext,
}: Props) => {
  return (
    <div className="border-t border-neutral-800 pt-6">
      {!isAnswered ? (
        // STATE 1: User is thinking
        <div>
          <div className="flex justify-end">
            <button
              onClick={onCheck}
              className="rounded-full bg-white px-8 py-3 font-bold text-black transition hover:scale-105 hover:bg-neutral-200"
            >
              Sprawdź odpowiedź
            </button>
          </div>
          {showHint && hint && (
            <div className="mt-6 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 px-4 pt-6 pb-6">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {hint}
              </Markdown>
            </div>
          )}
        </div>
      ) : (
        // STATE 2: User answered
        <div className="animate-in fade-in slide-in-from-top-2">
          {/* Next Button / Final Result Card */}
          {isLastQuestion ? (
            <div className="my-4 rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center">
              <h3 className="mb-2 text-lg font-bold text-white">
                Result:{" "}
                {Math.round((stats.correctCount / stats.totalQuestions) * 100)}%
              </h3>
              <p className="mb-6 text-sm text-neutral-400">
                {stats.isPassed
                  ? "Dobra robota! Ukończyłeś tę lekcje."
                  : "Potrzebujesz więcej niż 50% aby ukończyć tę lekcje."}
              </p>
              <button
                onClick={onNext}
                className={`w-full rounded-full py-3 font-bold text-white transition ${
                  stats.isPassed
                    ? "bg-green-600 hover:bg-green-500"
                    : "bg-red-600 hover:bg-red-500"
                }`}
              >
                {stats.isPassed
                  ? "Ukończ Lekcje i kontynuuj"
                  : "Spróbuj jeszcze raz"}
              </button>
            </div>
          ) : (
            <div className="mb-4 flex justify-end">
              <button
                onClick={onNext}
                className="flex justify-end rounded-full bg-blue-600 px-8 py-3 font-bold text-neutral-100 transition hover:scale-105 hover:bg-blue-500"
              >
                Następne Pytanie -&gt;
              </button>
            </div>
          )}

          {/* Correct/Incorrect Banner */}
          <div
            className={`mb-4 flex items-center gap-3 rounded-lg p-4 ${
              currentStatus === "correct"
                ? "bg-green-900/20 text-green-400"
                : "bg-red-900/20 text-red-400"
            }`}
          >
            <span className="text-2xl">
              {currentStatus === "correct" ? "🎉" : "❌"}
            </span>
            <div className="font-bold">
              {currentStatus === "correct"
                ? "Dobrze!"
                : "Nieprawidłowa Odpowiedź"}
            </div>
          </div>

          {/* Explanation */}
          {explanation && (
            <div className="mt-6 mb-6 rounded-xl bg-neutral-800 p-6 text-neutral-300">
              <Markdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
              >
                {explanation}
              </Markdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
