"use client";
import { useState } from "react";
import Editor from "./Editor";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import useAttemptRestore from "./loadFromBrowserStorage";

/* TODO:
1. Undo & redo.
2. Add/update/delete question
3. Implement question types
4. Render
5. Persistence
*/

export default function EscapeRoomPage() {
  const [isQuestionsPanelOpen, setIsQuestionsPanelOpen] = useState(false);
  const {
    bgImgUrl,
    questions,
    setQuestions,
    setBgImgUrl,
    hasAttemptedRestore,
  } = useAttemptRestore();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setBgImgUrl(URL.createObjectURL(file));
    } else {
      setBgImgUrl(null);
    }
  }

  function handleDeleteImage() {
    URL.revokeObjectURL(bgImgUrl!);
    setBgImgUrl(null);
  }

  return (
    <div className="min-h-screen flex justify-center px-5 md:px-8 py-5 md:py-12">
      {!bgImgUrl && hasAttemptedRestore && (
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
        <div className="flex flex-col items-center">
          <div className="w-full flex justify-center items-center mb-2 gap-8">
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
          </div>
          <Editor
            bgImgUrl={bgImgUrl}
            questions={questions}
            setQuestions={setQuestions}
            isQuestionsPanelOpen={isQuestionsPanelOpen}
          />
        </div>
      )}
    </div>
  );
}
