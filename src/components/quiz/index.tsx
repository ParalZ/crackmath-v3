"use client";

import Markdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

import { QuizInterfaceProps } from "./types";
import { useQuiz } from "./useQuiz";

import { QuizNavigation } from "./ui/QuizNavigation";
import { QuizInputArea } from "./ui/QuizInputArea";
import { QuizFooter } from "./ui/QuizFooter";

export default function QuizInterface(props: QuizInterfaceProps) {
  const {
    currentIndex,
    setCurrentIndex,
    currentQ,
    currentStatus,
    isAnswered,
    userAnswer,
    handleAnswerChange,
    checkAnswer,
    handleNext,
    showHint,
    setShowHint,
    stats,
    history,
  } = useQuiz(props);

  if (!currentQ)
    return <div className="text-white">Brak załadowanych pytań</div>;

  const isLastQuestion = currentIndex === props.questions.length - 1;

  return (
    <div className="mx-auto max-w-4xl">
      <QuizNavigation
        total={props.questions.length}
        current={currentIndex}
        history={history}
        onNavigate={setCurrentIndex}
      />

      {/* SECTION: Main Card */}
      <div className="flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/80 p-10 backdrop-blur-sm transition-all">
        {/* Content Top: Text + Input */}
        <div>
          <div className="prose prose-invert mb-8 max-w-none text-xl">
            {/* Header: "Question X" + Hint Toggle */}
            <div className="mb-6 flex items-start justify-between">
              <span className="mb-2 block text-xs font-bold tracking-wider text-neutral-500 uppercase">
                {"Pytanie " + (currentIndex + 1)}
              </span>
              {!isAnswered && currentQ.hint && (
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-sm font-bold text-amber-500 transition-colors hover:text-amber-400"
                >
                  <span>
                    {showHint ? "Ukryj Podpowiedź" : "Pokaż Podpowiedź"}
                  </span>
                  <span>💡</span>
                </button>
              )}
            </div>

            {/* Question Text */}
            <Markdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {currentQ.question_text}
            </Markdown>
          </div>

          {/* Input Area (Delegated to sub-component) */}
          <div className="mb-8">
            <QuizInputArea
              question={currentQ}
              userAnswer={userAnswer}
              onChange={handleAnswerChange}
              onEnter={checkAnswer}
              status={currentStatus}
              disabled={isAnswered}
            />
          </div>
        </div>

        {/* SECTION: Footer (Delegated to sub-component) */}
        <QuizFooter
          isAnswered={isAnswered}
          isLastQuestion={isLastQuestion}
          currentStatus={currentStatus}
          hint={currentQ.hint}
          explanation={currentQ.explanation}
          showHint={showHint}
          stats={stats}
          onCheck={checkAnswer}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
