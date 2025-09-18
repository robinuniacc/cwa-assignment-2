"use client";

import {
  Dialog,
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

const defaultQuestion: Omit<Question, "position" | "id"> = {
  type: "short-answer",
  prompt: "What is the capital of France?",
  answer: "Paris",
};

const questionTargetSize = 32;

function getQuestionTargetCSSTop(y: number) {
  return y - questionTargetSize / 2;
}

function getQuestionTargetCSSLeft(x: number) {
  return x - questionTargetSize / 2;
}

function QuestionsPanel({
  questions,
  className,
}: {
  questions: Question[];
  className?: string;
}) {
  return (
    <div className={className}>
      {questions.map((q) => (
        <div key={q.id} className="border p-2 mb-2 rounded">
          <form className="grid grid-cols-[auto_1fr] gap-2">
            <label>ID: </label>
            <input type="text" readOnly value={q.id} className="mb-1" />
          </form>
          <p>{q.type}</p>
          <p>{q.prompt}</p>
        </div>
      ))}
    </div>
  );
}

function QuestionTarget({
  question,
  deleteQuestion,
  updateQuestion,
}: {
  question: Question;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<Question>) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [stopNextClick, setStopNextClick] = useState(false);
  const positionRef = useRef(question.position);

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
    <Dialog>
      <DialogTrigger
        ref={ref}
        className="min-w-8 min-h-8 rounded-4xl bg-blue-400 absolute cursor-pointer"
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
      ></DialogTrigger>
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
          <button
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
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Builder({
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

  function deleteQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function updateQuestion(id: string, updated: Partial<Question>) {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, ...updated } : q)),
    );
  }
  function handleClick(
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>,
  ): void {
    if (event.target !== canvasRef.current || event.ctrlKey) return;

    setQuestions(
      questions.concat({
        ...defaultQuestion,
        id: crypto.randomUUID(),
        position: {
          centerX: event.nativeEvent.offsetX,
          centerY: event.nativeEvent.offsetY,
        },
      }),
    );
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
          className="absolute top-0 w-full bottom-0 opacity-50 overflow-visible"
          onClick={handleClick}
        >
          {questions.map((q) => (
            <QuestionTarget
              key={q.id}
              question={q}
              deleteQuestion={deleteQuestion}
              updateQuestion={updateQuestion}
            />
          ))}
        </div>
      </div>
      <QuestionsPanel
        questions={questions}
        className={cn(isQuestionsPanelOpen ? "block" : "hidden", "w-1/4")}
      />
    </div>
  );
}
