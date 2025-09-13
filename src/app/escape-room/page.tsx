"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/shadcn/dialog";
import Image from "next/image";
import {
  useRef,
  useState,
  MouseEvent as ReactMouseEvent,
  useEffect,
} from "react";
import { openDB } from "idb";

/* TODO:
1. Undo & redo.
2. Add/update/delete question
3. Implement question types
4. Render
5. Persistence
*/

type Question = {
  id: string;
  type: "multiple-choice" | "short-answer" | "true-false";
  prompt: string;
  options?: string[]; // For multiple-choice questions
  answer: string | boolean; // String for short-answer, boolean for true-false
  position: { x: number; y: number }; // Position on the image
};

const defaultQuestion: Omit<Question, "position" | "id"> = {
  type: "short-answer",
  prompt: "What is the capital of France?",
  answer: "Paris",
};

const questionTargetSize = 32;
function QuestionTarget({
  question,
  deleteQuestion,
  updateQuestion,
}: {
  question: Question;
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<Question>) => void;
}) {
  return (
    <Dialog>
      <DialogTrigger
        className="min-w-8 min-h-8 rounded-4xl bg-blue-400 absolute cursor-pointer"
        style={{
          top: question.position.y - questionTargetSize / 2,
          left: question.position.x - questionTargetSize / 2,
        }}
        onClick={(e) => {
          if (e.ctrlKey) {
            e.nativeEvent.stopImmediatePropagation();
            deleteQuestion(question.id);
          }
        }}
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
              alert(
                (document.getElementById("answer") as HTMLInputElement).value,
              );
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

export default function EscapeRoomPage() {
  const [bgImgUrl, setBgImgUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [tryLoadFromLS, setLoadedFromLocalStorage] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function saveImageToIndexedDB(image: Blob) {
      const db = await openDB("escapeRoomDB", 1, {
        upgrade(db) {
          db.createObjectStore("images");
        },
      });
      await db.put("images", image, "bgImage");
    }

    async function loadImageFromIndexedDB() {
      const db = await openDB("escapeRoomDB", 1, {
        upgrade(db) {
          db.createObjectStore("images");
        },
      });
      const image = await db.get("images", "bgImage");
      return image;
    }

    if (!tryLoadFromLS) {
      const savedQuestions = localStorage.getItem("escapeRoomQuestions");
      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
        loadImageFromIndexedDB().then((img) => {
          if (img) {
            setBgImgUrl(URL.createObjectURL(img));
          }
        });
      }
      setLoadedFromLocalStorage(true);
    } else {
      localStorage.setItem("escapeRoomQuestions", JSON.stringify(questions));
      if (bgImgUrl) {
        async function updateImageInStorage(url: string) {
          const response = await fetch(url);
          saveImageToIndexedDB(await response.blob());
        }
        updateImageInStorage(bgImgUrl);
      }
    }
  }, [questions, bgImgUrl, tryLoadFromLS]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBgImgUrl(URL.createObjectURL(file));
    } else {
      setBgImgUrl(null);
    }
  }

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
    if (event.target !== canvasRef.current) return;

    setQuestions(
      questions.concat({
        ...defaultQuestion,
        id: crypto.randomUUID(),
        position: {
          x: event.nativeEvent.offsetX,
          y: event.nativeEvent.offsetY,
        },
      }),
    );
  }

  return (
    <div className="min-h-screen flex justify-center px-5 md:px-8 py-5 md:py-12">
      {!bgImgUrl && tryLoadFromLS && (
        <form className="flex flex-col items-center gap-4">
          <label className="font-semibold">Upload an image file:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border px-2 py-1 rounded"
          />
        </form>
      )}
      {bgImgUrl && (
        <div className="relative w-3/4 h-fit">
          <Image
            src={bgImgUrl}
            alt="Preview"
            width={200}
            height={200}
            className="rounded shadow w-full"
          />
          <div
            ref={canvasRef}
            className="absolute top-0 w-full bottom-0 opacity-50 overflow-clip"
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
      )}
    </div>
  );
}
