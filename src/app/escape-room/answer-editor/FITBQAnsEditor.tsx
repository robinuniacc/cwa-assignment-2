import { FillInTheBlanksQuestion } from "../typings";
import { useState, useEffect, useContext } from "react";
import { EditorContext } from "../workSpaceContext";

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // cleanup if value or delay changes
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function Answer({
  answer,
  onAnsChanged,
}: {
  answer: AnswerWithId;
  onAnsChanged: (ansId: AnswerWithId["id"], newAns: string) => void;
}) {
  return (
    <>
      <input
        className="w-full text-left py-2 px-4"
        value={answer.answer}
        onChange={(e) => onAnsChanged(answer.id, e.target.value)}
      />
    </>
  );
}

type AnswerWithId = {
  id: string;
  answer: FillInTheBlanksQuestion["answer"][number];
};

export default function FITBQAnsEditor({
  question,
  registerOnClose,
  deregisterOnClose,
}: {
  question: FillInTheBlanksQuestion;
  registerOnClose: (fn: () => void) => void;
  deregisterOnClose: (fn: () => void) => void;
}) {
  const [answers, setAnswers] = useState<AnswerWithId[]>(() =>
    question.answer.map((a) => ({ id: computeAnswerId(a), answer: a })),
  );
  const { updateQuestion } = useContext(EditorContext);

  useEffect(() => {
    setAnswers(
      question.answer.map((a) => ({ id: computeAnswerId(a), answer: a })),
    );
  }, [question.answer]);

  useEffect(() => {
    const updateAnswers = () => {
      // Update the question's answers
      updateQuestion(question.id, {
        ...question,
        answer: answers.map((a) => a.answer),
      });
    };

    console.log("dsa");
    registerOnClose(updateAnswers);
    return () => deregisterOnClose(updateAnswers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers, question.id]);

  function handleAnswerChanged(id: AnswerWithId["id"], newAns: string) {
    setAnswers((prevAnswers) =>
      prevAnswers.map((ans) =>
        ans.id === id ? { ...ans, answer: newAns } : ans,
      ),
    );
  }

  return (
    <div className="overflow-y-auto max-h-44">
      Actual Answer:
      <ul>
        {answers.map((answer) => (
          <li key={answer.id}>
            <Answer answer={answer} onAnsChanged={handleAnswerChanged} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function computeAnswerId(answer: string) {
  return `${answer}-${crypto.randomUUID()}`;
}
