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
import Image from "next/image";

const HIGHLIGHTED_QUESTION_ANIMATION_MS = 1000;
const QUESTION_SPRITE_SIZE = 40;

function computeQuestionSpriteCSSTop(y: number) {
  return y - QUESTION_SPRITE_SIZE / 2;
}

function computeQuestionSpriteCSSLeft(x: number, width?: number) {
  if (width === undefined) return 0;
  return x - width / 2;
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
  const { ref, width } = useResizeDetector<HTMLButtonElement>();
  const [suppressClickHandlers, setSuppressClickHandlers] = useState(false);
  const positionRef = useRef(question.position);
  const [isAnimating] = useAnimationStatus(isHighlighted);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (ref.current == null) return;
    ref.current!.style.left =
      computeQuestionSpriteCSSLeft(question.position.centerX, width) + "px";
    ref.current!.style.top =
      computeQuestionSpriteCSSTop(question.position.centerY) + "px";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, question.position.centerX, question.position.centerY]);

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
        computeQuestionSpriteCSSLeft(positionRef.current.centerX, width) + "px";
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isMouseDown, width],
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
      // Clicking would open the shadcn dialog. We want to suppress it if we just finished a drag.
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
          "absolute cursor-pointer overflow-visible flex flex-col items-center",
          isAnimating ? "animate-bounce animation-duration-[300ms]" : "",
        )}
        style={{
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
        <Image
          className="rounded-4xl"
          style={{
            width: QUESTION_SPRITE_SIZE,
            height: QUESTION_SPRITE_SIZE,
          }}
          src={"/question-mark.png"}
          alt="Question Sprite"
          width={QUESTION_SPRITE_SIZE}
          height={QUESTION_SPRITE_SIZE}
        />
        <div className="bg-foreground text-background w-fit rounded-[8px] shadow-2xl p-2 max-w-28 text-[10px] text-center">
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
