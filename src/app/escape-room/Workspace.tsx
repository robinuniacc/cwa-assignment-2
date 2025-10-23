"use client";

import { useRef, MouseEvent as ReactMouseEvent } from "react";
import Image from "next/image";
import { Question } from "./typings";
import { cn } from "@/lib/utils";
import { EditorContext } from "./workSpaceContext";
import EditableQuestionSprite, {
  DEFAULT_QUESTIONS,
} from "./EditableQuestionSprite";
import { v4 as uuidv4 } from "uuid";

export default function Workspace({
  questions,
  setQuestions,
  bgImgUrl,
  imgSize,
  setImgSize,
}: {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  bgImgUrl: string;
  imgSize: { width: number; height: number };
  setImgSize:
    | React.Dispatch<React.SetStateAction<{ width: number; height: number }>>
    | ((size: { width: number; height: number }) => void);
}) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const newQuestionRef = useRef<Question | null>(null);

  const isResizingRef = useRef(false);
  const sizeBeforeResizeRef = useRef<{
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  function handleResizeMouseDown(
    e: ReactMouseEvent<HTMLDivElement, MouseEvent>,
  ) {
    e.stopPropagation();
    isResizingRef.current = true;
    sizeBeforeResizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: imgSize.width,
      startHeight: imgSize.height,
    };
    window.addEventListener("mousemove", handleResizeMouseMove);
    window.addEventListener("mouseup", handleResizeMouseUp);
  }
  function handleResizeMouseMove(e: MouseEvent) {
    if (!isResizingRef.current || !sizeBeforeResizeRef.current) return;
    const { startX, startY, startWidth, startHeight } =
      sizeBeforeResizeRef.current;
    const newWidth = Math.max(100, startWidth + (e.clientX - startX));
    const newHeight = Math.max(100, startHeight + (e.clientY - startY));

    // Update question positions proportionally.
    // If a question was on a chest, when the image is resized, it should still be on the chest.
    setQuestions(
      questions.map((q) => {
        return {
          ...q,
          position: {
            centerX: q.position.centerX * (newWidth / imgSize.width),
            centerY: q.position.centerY * (newHeight / imgSize.height),
          },
        };
      }),
    );
    setImgSize({
      width: newWidth,
      height: newHeight,
    });
  }
  function handleResizeMouseUp() {
    isResizingRef.current = false;
    sizeBeforeResizeRef.current = null;
    window.removeEventListener("mousemove", handleResizeMouseMove);
    window.removeEventListener("mouseup", handleResizeMouseUp);
  }

  function deleteQuestion(id: string) {
    setQuestions(questions.filter((q) => q.id !== id));
  }

  function safeUpdateQuestion(id: string, updated: Partial<Question>) {
    // Prevent empty IDs
    if (updated.id && updated.id === "") {
      return;
    }

    setQuestions((questions) => {
      const newQs = questions.map((q) => {
        if (q.id !== id) return q;

        if (
          updated.type &&
          q.type === "multiple-choice" &&
          updated.type !== "short-answer"
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { choices, ...rest } = q;
          return { ...rest, ...updated } as Question;
        } else if (
          updated.type &&
          q.type !== "multiple-choice" &&
          updated.type === "multiple-choice"
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { answer, ...rest } = q;
          return { ...rest, ...updated } as Question;
        }
        return { ...q, ...updated } as Question;
      });
      // Ensure no duplicate IDs
      const ids = new Set(newQs.map((q) => q.id));
      if (ids.size !== newQs.length) return questions;

      return newQs;
    });
  }

  function handleCanvasClick(
    event: ReactMouseEvent<HTMLDivElement, MouseEvent>,
  ): void {
    if (event.target !== canvasRef.current || event.ctrlKey) return;

    const newQuestion = {
      ...DEFAULT_QUESTIONS["short-answer"],
      id: uuidv4(),
      position: {
        centerX: event.nativeEvent.offsetX,
        centerY: event.nativeEvent.offsetY,
      },
    };
    setQuestions(questions.concat(newQuestion));

    newQuestionRef.current = newQuestion;
  }
  return (
    <EditorContext
      value={{
        deleteQuestion,
        updateQuestion: safeUpdateQuestion,
      }}
    >
      <div className="flex justify-center gap-8">
        <div
          id="canvas-container"
          className={cn("relative")}
          style={{ width: imgSize.width, height: imgSize.height }}
        >
          <Image
            src={bgImgUrl}
            alt="Preview"
            width={imgSize.width}
            height={imgSize.height}
            className="rounded shadow w-full h-full select-none pointer-events-none"
            draggable={false}
            style={{
              width: imgSize.width,
              height: imgSize.height,
            }}
          />
          {/* --- Resize handle --- */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute -right-2.5 -bottom-2.5 w-2.5 h-2.5 cursor-nwse-resize z-10 select-none"
            title="Resize"
          ></div>
          <div
            id="canvas"
            ref={canvasRef}
            className="absolute top-0 w-full bottom-0 opacity-100 overflow-visible"
            onClick={handleCanvasClick}
            style={{ height: imgSize.height, width: imgSize.width }}
          >
            {questions.map((q) => (
              <EditableQuestionSprite
                key={q.id}
                question={q}
                defaultOpen={newQuestionRef.current?.id === q.id}
                isHighlighted={false}
              />
            ))}
          </div>
        </div>
      </div>
    </EditorContext>
  );
}
