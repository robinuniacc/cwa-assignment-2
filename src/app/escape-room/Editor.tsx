"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn/dialog";
import {
  useRef,
  MouseEvent as ReactMouseEvent,
  useState,
  useEffect,
  useCallback,
} from "react";
import Image from "next/image";
import { Question } from "./types";
import { cn } from "@/lib/utils";
import { useResizeDetector } from "react-resize-detector";

const defaultQuestion: Omit<Question, "position" | "id"> = {
  type: "short-answer",
  prompt: "What is the capital of France?",
  answer: "Paris",
};

const HIGHLIGHTED_QUESTION_ANIMATION_MS = 2000;
const QUESTION_TARGET_SIZE = 32;

function limitStrLen(str: string, n: number) {
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
}

function getQuestionTargetCSSTop(y: number) {
  return y - QUESTION_TARGET_SIZE / 2;
}

function getQuestionTargetCSSLeft(x: number) {
  return x - QUESTION_TARGET_SIZE / 2;
}

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
      <p>Q: {limitStrLen(q.prompt, 32)}</p>
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

function QuestionSprite({
  question,
  deleteQuestion,
  updateQuestion,
  isHighlighted,
  defaultOpen = false,
}: {
  question: Question;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<Question>) => boolean;
  isHighlighted?: boolean;
  defaultOpen?: boolean;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const { width: tooltipWidth, ref: tooltipRef } = useResizeDetector();
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [stopNextClick, setStopNextClick] = useState(false);
  const positionRef = useRef(question.position);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (!tooltipRef.current) {
      return;
    }

    const widthAndPadding =
      tooltipRef.current!.offsetWidth +
      tooltipRef.current!.style.paddingLeft +
      tooltipRef.current!.style.paddingRight;
    tooltipRef.current!.style.left =
      QUESTION_TARGET_SIZE / 2 - widthAndPadding / 2 + "px";
  }, [tooltipWidth, tooltipRef]);

  useEffect(() => {
    if (isHighlighted) {
      setIsAnimating(true);
      const timeout = setTimeout(
        () => setIsAnimating(false),
        HIGHLIGHTED_QUESTION_ANIMATION_MS,
      );
      return () => {
        clearTimeout(timeout);
        setIsAnimating(false);
      };
    }
  }, [isHighlighted]);

  const onWindowMouseMoveCallback = useCallback(
    (e: MouseEvent) => {
      if (!isMouseDown) return;

      positionRef.current = {
        centerX:
          e.pageX - document.getElementById("canvas-container")!.offsetLeft,
        centerY:
          e.pageY - document.getElementById("canvas-container")!.offsetTop,
      };

      ref.current!.style.top =
        getQuestionTargetCSSTop(positionRef.current.centerY) + "px";
      ref.current!.style.left =
        getQuestionTargetCSSLeft(positionRef.current.centerX) + "px";
    },
    [isMouseDown],
  );

  function onMouseDown(e: ReactMouseEvent) {
    e.preventDefault();
    setIsMouseDown(true);

    positionRef.current = question.position;
  }

  function onMouseUp() {
    if (
      positionRef.current.centerX !== question.position.centerX &&
      positionRef.current.centerY !== question.position.centerY
    ) {
      setStopNextClick(true);
      updateQuestion(question.id, { position: positionRef.current });
    }

    setIsMouseDown(false);
  }

  useEffect(() => {
    if (!isMouseDown) return;

    window.addEventListener("mousemove", onWindowMouseMoveCallback);

    return () => {
      window.removeEventListener("mousemove", onWindowMouseMoveCallback);
    };
  }, [isMouseDown, onWindowMouseMoveCallback]);

  return (
    <Dialog defaultOpen={defaultOpen}>
      <DialogTrigger
        ref={ref}
        className={cn(
          "absolute cursor-pointer",
          isAnimating ? "animate-bounce animation-duration-[300ms]" : "",
        )}
        style={{
          top: getQuestionTargetCSSTop(question.position.centerY),
          left: getQuestionTargetCSSLeft(question.position.centerX),
          zIndex: isMouseDown ? 50 : undefined,
          opacity: isMouseDown ? 0.7 : 1,
        }}
        onClick={(e) => {
          if (stopNextClick) {
            e.preventDefault();
            e.nativeEvent.stopImmediatePropagation();
            setStopNextClick(false);
            return;
          }
          if (e.ctrlKey) {
            e.nativeEvent.stopImmediatePropagation();
            deleteQuestion(question.id);
          }
        }}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        // Prevent dialog open on drag
        tabIndex={0}
      >
        <div
          className="rounded-4xl bg-blue-900"
          style={{
            width: QUESTION_TARGET_SIZE,
            height: QUESTION_TARGET_SIZE,
          }}
        ></div>
        <div
          ref={tooltipRef}
          className="bg-foreground text-background w-fit rounded-[8px] shadow-2xl p-2 max-w-28 text-[10px] text-center relative"
        >
          {limitStrLen(question.prompt, 34)}
        </div>
      </DialogTrigger>
      <DialogContent className="bg-white p-4 rounded shadow-lg">
        <DialogTitle className="mb-4 font-bold">Question</DialogTitle>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <label htmlFor="prompt">Prompt</label>
            <input id="prompt" name="prompt" defaultValue={question.prompt} />
          </div>
          <div className="grid gap-3">
            <label htmlFor="answer">Answer</label>
            <input
              id="answer"
              name="answer"
              defaultValue={question.answer as string}
            />
          </div>
          <DialogClose
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
            onClick={() => {
              updateQuestion(question.id, {
                prompt: (document.getElementById("prompt") as HTMLInputElement)
                  .value,
                answer: (document.getElementById("answer") as HTMLInputElement)
                  .value,
              });
            }}
          >
            Save
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
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
      q.id === id ? { ...q, ...updated } : q,
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
      ...defaultQuestion,
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
            <QuestionSprite
              key={q.id}
              question={q}
              deleteQuestion={deleteQuestion}
              updateQuestion={safeUpdateQuestion}
              isHighlighted={highlightedQuestionId === q.id}
              defaultOpen={newQuestionRef.current?.id === q.id}
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
  );
}
