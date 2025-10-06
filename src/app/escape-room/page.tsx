"use client";
import { useState } from "react";
import Workspace from "./Workspace";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import useAttemptRestore from "./loadFromBrowserStorage";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../components/shadcn/dialog";
import useDbStoreAndS3 from "@/hooks/useDbStoreAndS3";

/* TODO:
1. Undo & redo.
2. Add/update/delete question
3. Implement question types
4. Render
5. Persistence
*/

function InstructionsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
          title="Find-question Panel"
        >
          Instructions
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Instructions</DialogTitle>
        <p>First upload an image</p>
        <p>Add questions by clicking on the image</p>
        <p>Each question can be edited by clicking on it</p>
        <p>Questions can be moved around by dragging it</p>
        <p>To remove a question, ctrl + click on the question</p>
        <p>
          When you have many questions, you may find it hard to locate where it
          is on the canvas. In this case, you can use the question list panel to
          quickly to select your question to highlight its position on the
          canvas
        </p>
      </DialogContent>
    </Dialog>
  );
}

function UseDefaultImgButton({
  handleBgImgChange,
  handleDeleteImage,
}: {
  handleBgImgChange: (url: string) => void;
  handleDeleteImage: () => void;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        handleDeleteImage();
        const img = await fetch("/escape-room-bg.jpg");
        const imgBlob = await img.blob();
        handleBgImgChange(URL.createObjectURL(imgBlob));
      }}
      className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
      title="Find-question Panel"
    >
      Use Default Image
    </button>
  );
}

async function computeInstrinsicImgSize(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  return { width: bitmap.width, height: bitmap.height };
}

export default function EscapeRoomPage() {
  const [isQuestionsPanelOpen, setIsQuestionsPanelOpen] = useState(false);
  const {
    bgImgUrl,
    questions,
    setQuestions,
    setBgImgUrl,
    hasAttemptedRestore,
    imgSize,
    setImgSize,
    save,
  } = useDbStoreAndS3();

  async function handleBgImgChange(newImgUrl: string) {
    const imgBlob = await fetch(newImgUrl).then((r) => r.blob());
    if (imgBlob) {
      setBgImgUrl(URL.createObjectURL(imgBlob));
      computeInstrinsicImgSize(imgBlob).then((size) => {
        setImgSize(size);
      });
    } else {
      setBgImgUrl(null);
    }
  }

  function handleDeleteImage() {
    URL.revokeObjectURL(bgImgUrl!);
    setBgImgUrl(null);
  }

  async function generateEscapeRoomPreviewUrl() {
    const bgImgBlob = await fetch(bgImgUrl!, {}).then((r) => r.blob());
    if (!bgImgBlob) {
      return new Response("Failed to fetch background image", { status: 400 });
    }
    const bgImgBase64 = await bgImgBlob
      .arrayBuffer()
      .then((buf) => Buffer.from(buf).toString("base64"));

    const response = await fetch("/escape-room/preview-api", {
      method: "POST",
      body: JSON.stringify({
        questions,
        bgImgBase64,
        bgImgMimeType: bgImgBlob.type,
        bgImgSize: imgSize,
      }),
    });

    const html = await response.text();
    window.open()?.document.writeln(html);
  }

  return (
    <div className="min-h-screen flex justify-center px-5 md:px-8 py-5 md:py-12">
      {!bgImgUrl && hasAttemptedRestore && (
        <form className="flex flex-col items-center gap-4">
          <label className="font-semibold">Upload an image file:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files &&
              handleBgImgChange(URL.createObjectURL(e.target.files[0]))
            }
            className="border px-2 py-1 rounded"
          />
          <InstructionsDialog />
          <UseDefaultImgButton
            handleBgImgChange={handleBgImgChange}
            handleDeleteImage={handleDeleteImage}
          />
        </form>
      )}
      {bgImgUrl && (
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center items-center mb-2 gap-2 text-sm">
            <form>
              <label>Time</label>
              <input
                type="number"
                className="ml-2 w-16 text-center border-2 border-[var(--color-red-latrobe)] rounded-4xl"
                defaultValue={60}
              />{" "}
              seconds
            </form>
            <button
              type="button"
              onClick={handleDeleteImage}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
              title="Delete Image"
            >
              <FontAwesomeIcon icon={faTrash} className="h-5 w-5" />
              Delete Image
            </button>
            <button
              type="button"
              onClick={() => setIsQuestionsPanelOpen(!isQuestionsPanelOpen)}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
              title="Find-question Panel"
            >
              Find-Question Panel
            </button>
            <UseDefaultImgButton
              handleBgImgChange={handleBgImgChange}
              handleDeleteImage={handleDeleteImage}
            />
            <button
              type="button"
              onClick={() => generateEscapeRoomPreviewUrl()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
              title="Preview Escape Room"
            >
              Preview
            </button>
            <button
              type="button"
              onClick={() => save()}
              className="flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80"
              title="Save Escape Room"
            >
              Save
            </button>
            <InstructionsDialog />
          </div>
          <Workspace
            bgImgUrl={bgImgUrl}
            questions={questions}
            setQuestions={setQuestions}
            isQuestionsPanelOpen={isQuestionsPanelOpen}
            imgSize={imgSize}
            setImgSize={setImgSize}
          />
        </div>
      )}
    </div>
  );
}
