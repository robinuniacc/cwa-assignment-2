"use client";

import { useRef, MouseEvent as ReactMouseEvent, useState } from "react";
import Image from "next/image";
import { Question } from "./typings";
import { cn, limitStrLen } from "@/lib/utils";
import { EditorContext } from "./workSpaceContext";
import EditableQuestionSprite, {
  DEFAULT_QUESTIONS,
} from "./EditableQuestionSprite";

function QuestionsPanelEntry({
  q,
  setHighlightedQuestionId,
  className,
}: {
  q: Question;
  setHighlightedQuestionId: React.Dispatch<React.SetStateAction<string | null>>;
  className?: string;
}) {
  return (
    <button
      key={q.id}
      className={cn(
        "text-left min-w-full border p-2 mb-2 rounded hover:cursor-pointer",
        className,
      )}
      onClick={() => setHighlightedQuestionId(q.id)}
    >
      <p>Type: {q.type}</p>
      <p>Q: {limitStrLen(q.prompt.map((p) => p.prompt).join(" "), 32)}</p>
    </button>
  );
}

function QuestionsPanel({
  questions,
  className,
  highlightedQuestionId,
  setHighlightedQuestionId,
}: {
  questions: Question[];
  className?: string;
  highlightedQuestionId: string | null;
  setHighlightedQuestionId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <div className={cn(className)}>
      {questions.map((q) => (
        <QuestionsPanelEntry
          key={q.id}
          q={q}
          className={
            highlightedQuestionId == q.id
              ? "border-[var(--color-red-latrobe)] border-2"
              : ""
          }
          setHighlightedQuestionId={setHighlightedQuestionId}
        />
      ))}
    </div>
  );
}

export default function Editor({
  questions,
  setQuestions,
  bgImgUrl,
  isQuestionsPanelOpen,
}: {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  bgImgUrl: string;
  isQuestionsPanelOpen: boolean;
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<
    string | null
  >(null);
  const newQuestionRef = useRef<Question | null>(null);

  function deleteQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function safeUpdateQuestion(id: string, updated: Partial<Question>): boolean {
    // Prevent empty IDs
    if (updated.id && updated.id === "") {
      return false;
    }

    const newQs = questions.map((q) =>
      q.id === id ? ({ ...q, ...updated } as Question) : q,
    );

    // Ensure no duplicate IDs
    const ids = new Set(newQs.map((q) => q.id));
    if (ids.size !== newQs.length) return false;

    setQuestions(newQs);
    return true;
  }

  function handleCanvasClick(
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>,
  ): void {
    if (event.target !== canvasRef.current || event.ctrlKey) return;

    const newQuestion = {
      ...DEFAULT_QUESTIONS["short-answer"],
      id: crypto.randomUUID(),
      position: {
        centerX: event.nativeEvent.offsetX,
        centerY: event.nativeEvent.offsetY,
      },
    };
    setQuestions(questions.concat(newQuestion));

    newQuestionRef.current = newQuestion;
  }
  return (
    <EditorContext.Provider
      value={{
        deleteQuestion,
        updateQuestion: safeUpdateQuestion,
      }}
    >
      <div className="flex justify-center gap-8">
        <div
          id="canvas-container"
          className={cn("relative w-fit max-w-3/4 h-fit")}
        >
          <Image
            src={bgImgUrl}
            alt="Preview"
            width={200}
            height={200}
            className="rounded shadow w-auto h-auto"
          />
          <div
            id="canvas"
            ref={canvasRef}
            className="absolute top-0 w-full bottom-0 opacity-100 overflow-visible"
            onClick={handleCanvasClick}
          >
            {questions.map((q) => (
              <EditableQuestionSprite
                key={q.id}
                question={q}
                defaultOpen={newQuestionRef.current?.id === q.id}
                isHighlighted={highlightedQuestionId === q.id}
              />
            ))}
          </div>
        </div>
        <QuestionsPanel
          questions={questions}
          className={cn(isQuestionsPanelOpen ? "block" : "hidden", "w-1/4")}
          highlightedQuestionId={highlightedQuestionId}
          setHighlightedQuestionId={setHighlightedQuestionId}
        />
      </div>
    </EditorContext.Provider>
  );
}
