import { renderHook, act } from "@testing-library/react";
import { useQuiz } from "../useQuiz";
import { Question } from "../types";

jest.mock("@/app/courses/actions", () => ({
  recordCorrectAnswer: jest.fn().mockResolvedValue(true),
  completeLesson: jest.fn().mockResolvedValue(true),
}));

// 1. MOCK ROUTER (Because useQuiz uses useRouter)
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockQuestions: Question[] = [
  {
    id: "q1",
    question_type: "open",
    question_text: "Solve 2x = 10",
    options: null,
    correct_answer: "5",
    hint: "Divide by 2",
    explanation: "Simple algebra",
    answer_mode: "SAME_VALUE",
  },
  {
    id: "q2",
    question_type: "single_choice",
    question_text: "What is 2+2?",
    options: ["3", "4", "5"],
    correct_answer: "1",
    hint: null,
    explanation: null,
    answer_mode: "",
  },
];

const defaultProps = {
  questions: mockQuestions,
  nextUrl: "/next-lesson",
  lessonId: "lesson-1",
  courseSlug: "math-101",
  segmentSlug: "algebra",
  completedQuestionIds: [],
};

describe("useQuiz Logic", () => {
  it("initializes with the first question", () => {
    const { result } = renderHook(() => useQuiz(defaultProps));

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("moves to the next question", async () => {
    const { result } = renderHook(() => useQuiz(defaultProps));

    await act(async () => {
      await result.current.handleNext();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.currentQ.id).toBe("q2");
  });

  it("toggles hint visibility", () => {
    const { result } = renderHook(() => useQuiz(defaultProps));

    expect(result.current.showHint).toBe(false);

    act(() => {
      result.current.setShowHint(true);
    });

    expect(result.current.showHint).toBe(true);
  });
});

describe("Single Choice Questions Logic", () => {
  const singleChoiceProps = {
    ...defaultProps,
    questions: [
      {
        id: "q_sc",
        question_type: "single_choice" as const,
        question_text: "What is 2+2?",
        options: ["3", "4", "5"],
        correct_answer: "1",
        hint: null,
        explanation: null,
        answer_mode: "",
      },
    ],
  };
  it("marks the question CORRECT when user selects a valid index", async () => {
    const { result } = renderHook(() => useQuiz(singleChoiceProps));

    act(() => {
      result.current.handleAnswerChange("1");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question INCORRECT when user selects a WRONG index", async () => {
    const { result } = renderHook(() => useQuiz(singleChoiceProps));

    act(() => {
      result.current.handleAnswerChange("0");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when user selects index OUT OF BOUNDS", async () => {
    const { result } = renderHook(() => useQuiz(singleChoiceProps));

    act(() => {
      result.current.handleAnswerChange("3");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });
});

describe("Multiple Choice Questions Logic", () => {
  const multipleChoiceProps = {
    ...defaultProps,
    questions: [
      {
        id: "q3",
        question_type: "multiple_choice" as const,
        question_text: "What is 2+2?",
        options: ["2", "4", "8/2", "5"],
        correct_answer: ["1", "2"],
        hint: null,
        explanation: null,
        answer_mode: "",
      },
    ],
  };
  it("marks the question CORRECT when correct indexes are chosen", async () => {
    const { result } = renderHook(() => useQuiz(multipleChoiceProps));

    act(() => {
      result.current.handleAnswerChange(["1", "2"]);
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question INCORRECT when only 1 correct answer is chosen", async () => {
    const { result } = renderHook(() => useQuiz(multipleChoiceProps));

    act(() => {
      result.current.handleAnswerChange(["2"]);
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when only 1 correct answer and 1 incorrect is chosen", async () => {
    const { result } = renderHook(() => useQuiz(multipleChoiceProps));

    act(() => {
      result.current.handleAnswerChange(["2", "3"]);
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when only 1 incorrect is chosen", async () => {
    const { result } = renderHook(() => useQuiz(multipleChoiceProps));

    act(() => {
      result.current.handleAnswerChange(["3"]);
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when multiple incorrect are chosen", async () => {
    const { result } = renderHook(() => useQuiz(multipleChoiceProps));

    act(() => {
      result.current.handleAnswerChange(["3", "0"]);
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });
});

describe("Open Questions Logic NO latex syntax", () => {
  const openProps = {
    ...defaultProps,
    questions: [
      {
        id: "q1",
        question_type: "open" as const,
        question_text: "ile to 6x = 12",
        options: null,
        correct_answer: "2",
        hint: "Divide by 2",
        explanation: "Simple algebra",
        answer_mode: "SAME_VALUE",
      },
    ],
  };
  it("marks the question CORRECT when user types good answer", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("2");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question INCORRECT user types incorrect answer", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("300");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question CORRECT with latex syntax answer and SAME_VALUE mode", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("300");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });
});

describe("Open Questions Logic WITH latex syntax answer", () => {
  const openProps = {
    ...defaultProps,
    questions: [
      {
        id: "q1",
        question_type: "open" as const,
        question_text: "ile to ile to 6x = 1",
        options: null,
        correct_answer: "\\frac{1}{6}",
        hint: "Divide by 2",
        explanation: "Simple algebra",
        answer_mode: "SAME_VALUE",
      },
    ],
  };
  it("marks the question CORRECT when correct answer with latex syntax", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{1}{6}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question CORRECT when correct answer but NOT EXCACTLY SAME as in database", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{2}{12}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question INCORRECT when correct answer with correct latex syntax but wrong answer", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{1}{7}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when the syntax of answer is incorrect", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange(".");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });
});

describe("Open Questions Logic EXACT answer mode", () => {
  const openProps = {
    ...defaultProps,
    questions: [
      {
        id: "q1",
        question_type: "open" as const,
        question_text: "ile to ile to 6x = 1",
        options: null,
        correct_answer: "\\frac{1}{6}",
        hint: "Divide by 2",
        explanation: "Simple algebra",
        answer_mode: "EXACT",
      },
    ],
  };
  it("marks the question CORRECT when correct answer with latex syntax", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{1}{6}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("correct");
    expect(result.current.stats.correctCount).toBe(1);
  });

  it("marks the question INCORRECT when correct answer (mathematically) but not EXCACTLY SAME as in database", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{2}{12}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when correct answer with correct latex syntax but wrong answer", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange("\\frac{1}{7}");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });

  it("marks the question INCORRECT when the syntax of answer is incorrect", async () => {
    const { result } = renderHook(() => useQuiz(openProps));

    act(() => {
      result.current.handleAnswerChange(".");
    });

    await act(async () => {
      await result.current.checkAnswer();
    });

    expect(result.current.currentStatus).toBe("incorrect");
    expect(result.current.stats.correctCount).toBe(0);
  });
});
