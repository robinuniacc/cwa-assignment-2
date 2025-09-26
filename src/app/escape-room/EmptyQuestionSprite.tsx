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
  useContext,
} from "react";
import { Question } from "./typings";
import { cn, limitStrLen } from "@/lib/utils";
import { useResizeDetector } from "react-resize-detector";
import { EditorContext } from "./workSpaceContext";

const HIGHLIGHTED_QUESTION_ANIMATION_MS = 1000;
const QUESTION_SPRITE_SIZE = 32;

function computeQuestionSpriteCSSTop(y: number) {
  return y - QUESTION_SPRITE_SIZE / 2;
}

function computeQuestionSpriteCSSLeft(x: number) {
  return x - QUESTION_SPRITE_SIZE / 2;
}

function useAnimationStatus(play: boolean) {
  const [isAnimating, setIsAnimating] = useState(false);
  useEffect(() => {
    if (play) {
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
  }, [play]);

  return [isAnimating, setIsAnimating];
}

function useRefResponsiveTooltip(targetSize: number) {
  const { width: tooltipWidth, ref: tooltipRef } = useResizeDetector();
  useEffect(() => {
    if (!tooltipRef.current) {
      return;
    }

    const widthAndPadding =
      tooltipRef.current!.offsetWidth +
      tooltipRef.current!.style.paddingLeft +
      tooltipRef.current!.style.paddingRight;
    tooltipRef.current!.style.left =
      targetSize / 2 - widthAndPadding / 2 + "px";
  }, [tooltipWidth, tooltipRef, targetSize]);
  return tooltipRef;
}

export default function QuestionSprite({
  children,
  question,
  isHighlighted = false,
  defaultOpen = false,
  onClose,
}: {
  children?: React.ReactNode;
  question: Question;
  isHighlighted: boolean;
  defaultOpen: boolean;
  onClose: () => void;
}) {
  const { updateQuestion, deleteQuestion } = useContext(EditorContext);
  const ref = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRefResponsiveTooltip(QUESTION_SPRITE_SIZE);
  const [suppressClickHandlers, setSuppressClickHandlers] = useState(false);
  const positionRef = useRef(question.position);
  const [isAnimating] = useAnimationStatus(isHighlighted);
  const [isMouseDown, setIsMouseDown] = useState(false);

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
        computeQuestionSpriteCSSTop(positionRef.current.centerY) + "px";
      ref.current!.style.left =
        computeQuestionSpriteCSSLeft(positionRef.current.centerX) + "px";
    },
    [isMouseDown],
  );

  useEffect(() => {
    if (!isMouseDown) return;

    window.addEventListener("mousemove", onWindowMouseMoveCallback);

    return () => {
      window.removeEventListener("mousemove", onWindowMouseMoveCallback);
    };
  }, [isMouseDown, onWindowMouseMoveCallback]);

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
      setSuppressClickHandlers(true);
      updateQuestion(question.id, { position: positionRef.current });
    }

    setIsMouseDown(false);
  }

  return (
    <Dialog
      defaultOpen={defaultOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogTrigger
        ref={ref}
        className={cn(
          "absolute cursor-pointer",
          isAnimating ? "animate-bounce animation-duration-[300ms]" : "",
        )}
        style={{
          top: computeQuestionSpriteCSSTop(question.position.centerY),
          left: computeQuestionSpriteCSSLeft(question.position.centerX),
          zIndex: isMouseDown ? 50 : undefined,
          opacity: isMouseDown ? 0.7 : 1,
        }}
        onClick={(e) => {
          if (suppressClickHandlers) {
            e.preventDefault();
            e.nativeEvent.stopImmediatePropagation();
            setSuppressClickHandlers(false);
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
            width: QUESTION_SPRITE_SIZE,
            height: QUESTION_SPRITE_SIZE,
          }}
        ></div>
        <div
          ref={tooltipRef}
          className="bg-foreground text-background w-fit rounded-[8px] shadow-2xl p-2 max-w-28 text-[10px] text-center relative"
        >
          {limitStrLen(question.prompt.map((p) => p.prompt).join(" "), 34)}
        </div>
      </DialogTrigger>
      <DialogContent className="p-4 rounded shadow-lg max-h-96 overflow-y-auto">
        <DialogTitle className="mb-4 font-bold">Question</DialogTitle>
        <div className="grid gap-4">
          {children}
          <DialogClose className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer">
            Save
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
