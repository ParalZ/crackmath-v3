"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import nerdamer from "nerdamer/all.min";

// --- TYPES ---
type QuestionType = "single_choice" | "multiple_choice" | "open";

type Question = {
  id: string;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: any;
  hint: string | null;
  explanation: string | null;
};

type QuestionStatus = "unanswered" | "correct" | "incorrect" | "partial";

export default function QuizInterface({
  questions,
  nextUrl,
}: {
  questions: Question[];
  nextUrl: string;
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<QuestionStatus[]>(
    new Array(questions.length).fill("unanswered"),
  );

  const [userAnswer, setUserAnswer] = useState<string | string[]>("");
  const [showHint, setShowHint] = useState(false);

  const currentQ = questions[currentIndex];
  const currentStatus = history[currentIndex];
  const isAnswered = currentStatus !== "unanswered";

  // Reset state when question changes
  useEffect(() => {
    if (currentQ.question_type === "multiple_choice") {
      setUserAnswer([]);
    } else {
      setUserAnswer("");
    }
    setShowHint(false);
  }, [currentIndex, currentQ.question_type]);

  // --- LOGIC: CHECKER ---
  const checkAnswer = () => {
    let isCorrect = false;

    if (currentQ.question_type === "open") {
      try {
        isCorrect = nerdamer(userAnswer as string).eq(currentQ.correct_answer);
      } catch (e) {
        console.error("Nerdamer parse error", e);
        isCorrect = false;
      }
    } else if (currentQ.question_type === "single_choice") {
      isCorrect = userAnswer === currentQ.correct_answer;
    } else if (currentQ.question_type === "multiple_choice") {
      const userArr = (userAnswer as string[]).sort();
      const correctArr = (currentQ.correct_answer as string[]).sort();
      isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
    }

    const newHistory = [...history];
    newHistory[currentIndex] = isCorrect ? "correct" : "incorrect";
    setHistory(newHistory);
  };

  // --- LOGIC: SELECTION ---
  const toggleOption = (option: string) => {
    if (isAnswered) return;
    const currentList = userAnswer as string[];
    if (currentList.includes(option)) {
      setUserAnswer(currentList.filter((item) => item !== option));
    } else {
      setUserAnswer([...currentList, option]);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      router.push(nextUrl);
    }
  };

  if (!currentQ) return <div className="text-white">No questions loaded.</div>;

  return (
    <div className="mx-auto max-w-4xl">
      {/* 1. TOP NAVIGATION */}
      <div className="mb-8 flex flex-wrap gap-2">
        {questions.map((_, idx) => {
          const status = history[idx];
          const isActive = idx === currentIndex;
          let color = "bg-neutral-800 text-neutral-400 border-neutral-700";
          if (status === "correct")
            color = "bg-green-900/50 text-green-400 border-green-800";
          if (status === "incorrect")
            color = "bg-red-900/50 text-red-400 border-red-800";
          return (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all hover:bg-neutral-700 ${color} ${isActive ? "ring-2 ring-white" : ""}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 2. QUESTION CARD */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-10 backdrop-blur-sm">
        <div className="prose prose-invert mb-8 max-w-none text-xl">
          <span className="mb-2 block text-xs font-bold tracking-wider text-neutral-500 uppercase">
            {"Question " + (currentIndex + 1)}
          </span>
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {currentQ.question_text}
          </Markdown>
        </div>

        {/* INPUT AREA */}
        <div className="mb-8">
          {/* A: SINGLE CHOICE */}
          {currentQ.question_type === "single_choice" && (
            <div className="flex flex-col gap-3">
              {currentQ.options?.map((option) => (
                <button
                  key={option}
                  disabled={isAnswered}
                  onClick={() => setUserAnswer(option)}
                  className={`rounded-xl border px-6 py-4 text-left transition-all ${
                    isAnswered
                      ? option === currentQ.correct_answer
                        ? "border-green-500 bg-green-500/10"
                        : option === userAnswer
                          ? "border-red-500 bg-red-500/10"
                          : "border-neutral-800 opacity-50"
                      : userAnswer === option
                        ? "border-blue-500 bg-blue-500/10 text-white"
                        : "border-neutral-700 hover:bg-neutral-800"
                  }`}
                >
                  <Markdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {option}
                  </Markdown>
                </button>
              ))}
            </div>
          )}

          {/* B: MULTIPLE CHOICE */}
          {currentQ.question_type === "multiple_choice" && (
            <div className="flex flex-col gap-3">
              {currentQ.options?.map((option) => {
                const isSelected = (userAnswer as string[]).includes(option);
                const isActuallyCorrect = (
                  currentQ.correct_answer as string[]
                ).includes(option);

                return (
                  <button
                    key={option}
                    disabled={isAnswered}
                    onClick={() => toggleOption(option)}
                    className={`flex items-center gap-4 rounded-xl border px-6 py-4 text-left transition-all ${
                      isAnswered
                        ? isActuallyCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isSelected
                            ? "border-red-500 bg-red-500/10"
                            : "border-neutral-800 opacity-50"
                        : isSelected
                          ? "border-blue-500 bg-blue-500/10 text-white"
                          : "border-neutral-700 hover:bg-neutral-800"
                    }`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded border ${
                        isSelected || (isAnswered && isActuallyCorrect)
                          ? "border-transparent bg-current"
                          : "border-neutral-500"
                      }`}
                    >
                      {(isSelected || (isAnswered && isActuallyCorrect)) && (
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
          )}

          {/* C: OPEN TEXT/MATH */}
          {currentQ.question_type === "open" && (
            <div className="w-full">
              <input
                type="text"
                disabled={isAnswered}
                value={userAnswer as string}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !isAnswered) checkAnswer();
                }}
                placeholder="Type your answer..."
                className={`w-full rounded-xl border bg-neutral-950 px-6 py-4 text-lg text-white outline-none focus:border-blue-500 ${
                  isAnswered
                    ? currentStatus === "correct"
                      ? "border-green-500"
                      : "border-red-500"
                    : "border-neutral-700"
                }`}
              />
            </div>
          )}
        </div>

        {/* --- FIXED HINT SECTION --- */}
        {/* We moved this OUT of the footer and restored the full styling */}
        {!isAnswered && currentQ.hint && (
          <div className="mb-8">
            {!showHint ? (
              <button
                onClick={() => setShowHint(true)}
                className="flex items-center gap-2 text-sm font-medium text-amber-500 transition-colors hover:text-amber-400"
              >
                <span>💡 Show Hint</span>
              </button>
            ) : (
              <div className="animate-in fade-in slide-in-from-top-2 relative overflow-hidden rounded-lg border-l-4 border-amber-500 bg-neutral-800 p-5">
                <div className="flex items-start gap-3">
                  <span className="text-xl">💡</span>
                  <div className="space-y-1">
                    <p className="text-xs font-bold tracking-wider text-amber-500 uppercase">
                      Hint
                    </p>
                    <div className="prose prose-sm prose-invert text-neutral-300">
                      <Markdown
                        remarkPlugins={[remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {currentQ.hint}
                      </Markdown>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowHint(false)}
                  className="absolute top-2 right-2 text-neutral-500 hover:text-white"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        )}

        {/* ACTIONS & FEEDBACK */}
        <div className="border-t border-neutral-800 pt-6">
          {!isAnswered ? (
            <div className="flex justify-end">
              <button
                onClick={checkAnswer}
                className="rounded-full bg-white px-8 py-3 font-bold text-black transition hover:scale-105 hover:bg-neutral-200"
              >
                Check Answer
              </button>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-2">
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
                  {currentStatus === "correct" ? "Correct!" : "Incorrect"}
                </div>
              </div>

              {currentQ.explanation && (
                <div className="mb-6 rounded-xl bg-neutral-800 p-6 text-neutral-300">
                  <Markdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {currentQ.explanation}
                  </Markdown>
                </div>
              )}

              <button
                onClick={handleNext}
                className="w-full rounded-full bg-blue-600 py-3 font-bold text-white hover:bg-blue-500"
              >
                {currentIndex === questions.length - 1
                  ? "Finish"
                  : "Next Question ->"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
