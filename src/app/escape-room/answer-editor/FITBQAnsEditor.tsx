"use client";

import { FillInTheBlanksQuestion } from "../typings";
import { useState, useEffect, useContext, useRef } from "react";
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
  const ref = useRef<HTMLTextAreaElement>(null);
  function resize(e: HTMLTextAreaElement) {
    // Auto-resize textarea
    e.style.height = "";
    e.style.height = e.scrollHeight + "px";
  }
  useEffect(() => {
    if (!ref.current) return;
    resize(ref.current);
  }, []);

  return (
    <>
      <textarea
        ref={ref}
        value={answer.answer}
        rows={1}
        className="w-full resize-none h-auto"
        onChange={(e) => {
          resize(e.currentTarget);
          onAnsChanged(answer.id, e.target.value);
        }}
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
        answer: answers.map((a) => a.answer),
      });
    };

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
    <div>
      Actual Answer:
      <ul>
        {answers.map((answer, idx) => (
          <li key={answer.id} className="flex gap-2">
            <span>{idx + 1}. </span>
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
