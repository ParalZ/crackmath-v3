import { Question, QuestionStatus } from "../types";
import { SingleChoiceQuestion } from "../inputs/SingleChoiceQuestion";
import { MultipleChoiceQuestion } from "../inputs/MultipleChoiceQuestion";
import { OpenQuestion } from "../inputs/OpenQuestion";

type Props = {
  question: Question;
  userAnswer: string | string[];
  onChange: (val: string | string[]) => void;
  onEnter: () => void;
  status: QuestionStatus;
  disabled: boolean;
};

export const QuizInputArea = ({
  question,
  userAnswer,
  onChange,
  onEnter,
  status,
  disabled,
}: Props) => {
  switch (question.question_type) {
    case "single_choice":
      return (
        <SingleChoiceQuestion
          options={question.options || []}
          value={typeof userAnswer === "string" ? userAnswer : ""}
          onChange={(val) => onChange(val.toString())}
          disabled={disabled}
          correctAnswer={question.correct_answer}
          isAnswered={disabled}
        />
      );
    case "multiple_choice":
      return (
        <MultipleChoiceQuestion
          options={question.options || []}
          value={Array.isArray(userAnswer) ? userAnswer : []}
          onChange={(val) => onChange(val)}
          disabled={disabled}
          correctAnswer={question.correct_answer}
          isAnswered={disabled}
        />
      );
    case "open":
      return (
        <OpenQuestion
          value={typeof userAnswer === "string" ? userAnswer : ""}
          onChange={(val) => onChange(val)}
          onEnter={onEnter}
          disabled={disabled}
          status={status}
        />
      );
    default:
      return <div className="text-red-500">Unknown Question Type</div>;
  }
};
