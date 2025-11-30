"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { recordCorrectAnswer, completeLesson } from "@/app/courses/actions";

import { SingleChoiceQuestion } from "./SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "./MultipleChoiceQuestion";
import { OpenQuestion } from "./OpenQuestion";

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
  lessonId,
  courseSlug,
  segmentSlug,
  completedQuestionIds = [],
}: {
  questions: Question[];
  nextUrl: string;
  lessonId: string;
  courseSlug: string;
  segmentSlug: string;
  completedQuestionIds?: string[];
}) {
  const router = useRouter();

  // 1. STATE INITIALIZATION
  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnansweredIndex = questions.findIndex(
      (q) => !completedQuestionIds.includes(q.id),
    );
    return firstUnansweredIndex === -1 ? 0 : firstUnansweredIndex;
  });

  const [history, setHistory] = useState<QuestionStatus[]>(() => {
    return questions.map((q) =>
      completedQuestionIds.includes(q.id) ? "correct" : "unanswered",
    );
  });

  const [userAnswer, setUserAnswer] = useState<string | string[]>("");
  const [showHint, setShowHint] = useState(false);

  const answerRef = useRef<string | string[]>("");

  const currentQ = questions[currentIndex];
  const currentStatus = history[currentIndex];
  const isAnswered = currentStatus !== "unanswered";

  // --- NEW LOGIC: SCORE CALCULATION ---
  // Count how many are "correct" in the history array
  const correctCount = history.filter((h) => h === "correct").length;
  const totalQuestions = questions.length;
  // Calculate if they passed (> 50%)
  const isPassed = totalQuestions > 0 && correctCount / totalQuestions > 0.5;
  useEffect(() => {
    answerRef.current = userAnswer;
  }, [userAnswer]);

  useEffect(() => {
    if (currentQ.question_type === "multiple_choice") {
      setUserAnswer([]);
    } else {
      setUserAnswer("");
    }
    setShowHint(false);
  }, [currentIndex, currentQ.question_type]);

  const handleAnswerChange = (val: string | string[]) => {
    setUserAnswer(val);
    answerRef.current = val; // <--- Update Ref immediately
  };
  // --- LOGIC: CHECKER ---
  const checkAnswer = async () => {
    const answerToCheck = answerRef.current;

    console.log("Checking Answer:", answerToCheck); // Debugging: verify it's the full string
    let isCorrect = false;

    if (currentQ.question_type === "open") {
      setUserAnswer("");
      try {
        const userLatex = (userAnswer as string) || "";
        const correctLatex = (currentQ.correct_answer as string) || "";

        // 1. Parse both expressions
        const ce = new ComputeEngine();
        const userExpr = ce.parse(userLatex).simplify();
        const correctExpr = ce.parse(correctLatex).simplify();

        // 2. Compare them
        // We check isEqual() for math equality (best for students)
        // We check isSame() as a fallback for exact structural matches
        if (userExpr.isEqual(correctExpr) || userExpr.isSame(correctExpr)) {
          isCorrect = true;
        }

        // OPTIONAL Debugging: See how the engine interprets the input
        console.log("User Input:", userLatex);
        console.log("Parsed:", userExpr.latex);
        console.log("Is Correct:", isCorrect);
      } catch (e) {
        console.error("Parse error", e);
        isCorrect = false;
      }
    } else if (currentQ.question_type === "single_choice") {
      isCorrect = Number(userAnswer) === Number(currentQ.correct_answer);
    } else if (currentQ.question_type === "multiple_choice") {
      const userArr = (userAnswer as string[])
        .map(Number)
        .sort((a, b) => a - b);
      const correctArr = (currentQ.correct_answer as string[])
        .map(Number)
        .sort((a, b) => a - b);
      isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
    }
    const newHistory = [...history];
    newHistory[currentIndex] = isCorrect ? "correct" : "incorrect";
    setHistory(newHistory);

    if (isCorrect) {
      recordCorrectAnswer(currentQ.id).catch((err) => {
        console.error("Failed to record answer on server:", err);
      });
    }
  };

  // --- MODIFIED HANDLER ---
  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // LAST QUESTION LOGIC
      if (isPassed) {
        // Only mark complete if they passed
        await completeLesson(lessonId, courseSlug, segmentSlug);
        router.push(nextUrl);
      } else {
        // If failed, reload the page to let them try again
        // Or you could reset state manually here
        window.location.reload();
      }
    }
  };

  // --- RENDER HELPER ---
  const renderInputArea = () => {
    switch (currentQ.question_type) {
      case "single_choice":
        return (
          <SingleChoiceQuestion
            options={currentQ.options || []}
            // Fix: Ensure we don't pass an array to Single Choice
            value={typeof userAnswer === "string" ? userAnswer : ""}
            onChange={(val) => handleAnswerChange(val.toString())}
            disabled={isAnswered}
            correctAnswer={currentQ.correct_answer}
            isAnswered={isAnswered}
          />
        );
      case "multiple_choice":
        return (
          <MultipleChoiceQuestion
            options={currentQ.options || []}
            // Fix: Ensure we always pass an array (never a string)
            value={Array.isArray(userAnswer) ? userAnswer : []}
            onChange={(val) => handleAnswerChange(val)}
            disabled={isAnswered}
            correctAnswer={currentQ.correct_answer}
            isAnswered={isAnswered}
          />
        );
      case "open":
        return (
          <OpenQuestion
            // Fix: CRITICAL - Ensure we always pass a string (never an array)
            // This prevents the "first element of array" crash in MathLive
            value={typeof userAnswer === "string" ? userAnswer : ""}
            onChange={(val) => handleAnswerChange(val)}
            onEnter={checkAnswer}
            disabled={isAnswered}
            status={currentStatus}
          />
        );
      default:
        return <div className="text-red-500">Unknown Question Type</div>;
    }
  };

  if (!currentQ)
    return <div className="text-white">Brak załadowanych pytań</div>;

  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="mx-auto max-w-4xl">
      {/* 1. PROGRESS BAR / QUESTION NAV */}
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
              className={`flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-bold transition-all hover:bg-neutral-700 ${color} ${
                isActive ? "ring-2 ring-white" : ""
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* 2. SCORE DISPLAY (Optional, keeps user informed) */}
      <div className="mb-4 text-right text-sm text-neutral-500">
        Score: {correctCount} / {totalQuestions}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-10 backdrop-blur-sm">
        <div className="prose prose-invert mb-8 max-w-none text-xl">
          <span className="mb-2 block text-xs font-bold tracking-wider text-neutral-500 uppercase">
            {"Pytanie " + (currentIndex + 1)}
          </span>
          <Markdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
            {currentQ.question_text}
          </Markdown>
        </div>

        <div className="mb-8">{renderInputArea()}</div>

        {!isAnswered && currentQ.hint && (
          <div className="mb-8">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-amber-500"
            >
              {showHint ? "Hide Hint 💡" : "Show Hint 💡"}
            </button>
            {showHint && (
              <div className="mt-2 text-neutral-400">{currentQ.hint}</div>
            )}
          </div>
        )}

        <div className="border-t border-neutral-800 pt-6">
          {!isAnswered ? (
            <div className="flex justify-end">
              <button
                onClick={checkAnswer}
                className="rounded-full bg-white px-8 py-3 font-bold text-black transition hover:scale-105 hover:bg-neutral-200"
              >
                Sprawdź odpowiedź
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

              {/* --- 3. FINAL BUTTON LOGIC --- */}
              {isLastQuestion ? (
                // --- END OF QUIZ UI ---
                <div className="mt-6 rounded-xl border border-neutral-700 bg-neutral-800 p-6 text-center">
                  <h3 className="mb-2 text-lg font-bold text-white">
                    Result: {Math.round((correctCount / totalQuestions) * 100)}%
                  </h3>
                  <p className="mb-6 text-sm text-neutral-400">
                    {isPassed
                      ? "Great job! You have passed this lesson."
                      : "You need more than 50% correct to complete this lesson."}
                  </p>

                  <button
                    onClick={handleNext}
                    className={`w-full rounded-full py-3 font-bold text-white transition ${
                      isPassed
                        ? "bg-green-600 hover:bg-green-500"
                        : "bg-red-600 hover:bg-red-500"
                    }`}
                  >
                    {isPassed ? "Finish Lesson & Continue" : "Retry Lesson"}
                  </button>
                </div>
              ) : (
                // --- NORMAL NEXT BUTTON ---
                <button
                  onClick={handleNext}
                  className="mb-6 w-full rounded-full bg-blue-600 py-3 font-bold text-white hover:bg-blue-500"
                >
                  Następne Pytanie -&gt;
                </button>
              )}

              {currentQ.explanation && (
                <div className="mt-6 mb-6 rounded-xl bg-neutral-800 p-6 text-neutral-300">
                  <Markdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                  >
                    {currentQ.explanation}
                  </Markdown>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
