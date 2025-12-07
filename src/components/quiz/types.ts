export type QuestionType = "single_choice" | "multiple_choice" | "open";

export type Question = {
  id: string;
  question_type: QuestionType;
  question_text: string;
  options: string[] | null;
  correct_answer: any;
  hint: string | null;
  explanation: string | null;
  answer_mode: string;
};

export type QuestionStatus = "unanswered" | "correct" | "incorrect" | "partial";

export type QuizInterfaceProps = {
  questions: Question[];
  nextUrl: string;
  lessonId: string;
  courseSlug: string;
  segmentSlug: string;
  completedQuestionIds?: string[];
};
