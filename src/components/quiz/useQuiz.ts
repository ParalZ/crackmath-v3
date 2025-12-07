import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ComputeEngine } from "@cortex-js/compute-engine";
import { recordCorrectAnswer, completeLesson } from "@/app/courses/actions";
import { Question, QuestionStatus } from "./types";

type UseQuizProps = {
  questions: Question[];
  nextUrl: string;
  lessonId: string;
  courseSlug: string;
  segmentSlug: string;
  completedQuestionIds?: string[];
};

export const useQuiz = ({
  questions,
  nextUrl,
  lessonId,
  courseSlug,
  segmentSlug,
  completedQuestionIds = [],
}: UseQuizProps) => {
  const router = useRouter();

  // 1. STATE
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

  // 2. SCORING
  const correctCount = history.filter((h) => h === "correct").length;
  const totalQuestions = questions.length;
  const isPassed = totalQuestions > 0 && correctCount / totalQuestions > 0.5;

  // 3. EFFECTS
  useEffect(() => {
    answerRef.current = userAnswer;
  }, [userAnswer]);

  useEffect(() => {
    if (currentQ?.question_type === "multiple_choice") {
      setUserAnswer([]);
    } else {
      setUserAnswer("");
    }
    setShowHint(false);
  }, [currentIndex, currentQ?.question_type]);

  // 4. HANDLERS
  const handleAnswerChange = (val: string | string[]) => {
    setUserAnswer(val);
    answerRef.current = val;
  };

  const checkAnswer = async () => {
    const answerToCheck = answerRef.current;
    let isCorrect = false;

    if (currentQ.question_type === "open") {
      setUserAnswer(""); // Clear input on submit for open questions if desired
      try {
        const userLatex = (userAnswer as string) || "";
        const correctLatex = (currentQ.correct_answer as string) || "";
        const ce = new ComputeEngine();
        const userExpr = ce.parse(userLatex, { canonical: false });
        const correctExpr = ce.parse(correctLatex, { canonical: false });

        if (currentQ.answer_mode == "SAME_VALUE") {
          const userExprSimp = userExpr.simplify();
          const correctExprSimp = correctExpr.simplify(); // Fixed typo from previous code (userExpr -> correctExpr)
          if (
            userExprSimp.isEqual(correctExprSimp) ||
            userExprSimp.isSame(correctExprSimp)
          ) {
            isCorrect = true;
          }
        } else if (currentQ.answer_mode == "EXACT") {
          if (userExpr.isSame(correctExpr)) {
            isCorrect = true;
          }
        }
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
      recordCorrectAnswer(currentQ.id).catch((err) =>
        console.error("Failed to record answer:", err),
      );
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      if (isPassed) {
        await completeLesson(lessonId, courseSlug, segmentSlug);
        router.push(nextUrl);
      } else {
        window.location.reload();
      }
    }
  };

  // Return everything the UI needs
  return {
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
    stats: { correctCount, totalQuestions, isPassed },
    history,
  };
};
