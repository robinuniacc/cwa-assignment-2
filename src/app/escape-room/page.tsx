"use client";
import Workspace from "./Workspace";
import useDbAndS3 from "@/hooks/escape-room/useDbAndS3";
import { useEffect } from "react";
import Toolbar, { InstructionsDialog, UseDefaultImgButton } from "./Toolbar";
import { v4 as uuidv4 } from "uuid";

async function computeInstrinsicImgSize(blob: Blob) {
  const bitmap = await createImageBitmap(blob);
  return { width: bitmap.width, height: bitmap.height };
}

export default function EscapeRoomPage() {
  const store = useDbAndS3();
  const {
    rooms,
    setRooms,
    setCurrRoomId,
    bgImgUrl,
    questions,
    setQuestions,
    setBgImgUrl,
    hasAttemptedRestore,
    isRestoring,
    imgSize,
    setImgSize,
  } = store;

  useEffect(() => {
    if (!hasAttemptedRestore || isRestoring || rooms.length > 0) return;

    const newRoomId = uuidv4();
    setRooms([{ id: newRoomId, name: "My First Room" }]);
    setCurrRoomId(newRoomId);
  }, [hasAttemptedRestore, isRestoring, rooms, setCurrRoomId, setRooms]);

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

  return (
    <div className="min-h-screen flex justify-center px-5 md:px-8 py-5 md:py-12">
      {!bgImgUrl && hasAttemptedRestore && (
        <form className="flex flex-col items-center gap-4">
          <label className="font-semibold">Upload escape room bg image:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              e.target.files &&
              handleBgImgChange(URL.createObjectURL(e.target.files[0]))
            }
            className="max-w-56 border px-2 py-1 rounded"
          />
          <UseDefaultImgButton
            handleBgImgChange={handleBgImgChange}
            handleDeleteImage={handleDeleteImage}
          />
          <InstructionsDialog />
        </form>
      )}
      {bgImgUrl && (
        <div className="flex flex-col items-center">
          <Toolbar
            {...store}
            handleBgImgChange={handleBgImgChange}
            handleDeleteImage={handleDeleteImage}
          />
          <Workspace
            bgImgUrl={bgImgUrl}
            questions={questions}
            setQuestions={setQuestions}
            imgSize={imgSize}
            setImgSize={setImgSize}
          />
        </div>
      )}
    </div>
  );
}
