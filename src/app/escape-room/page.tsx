"use client";
import Workspace from "./Workspace";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCaretDown,
  faEdit,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../components/shadcn/dialog";
import useDbAndS3 from "@/hooks/escape-room/useDbAndS3";
import useBrowserStorage from "@/hooks/escape-room/useBrowserStorage";
import { useEffect, useRef, useState } from "react";
import { limitStrLen } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/shadcn/dropdown-menu";

function RoomSelector({
  rooms,
  setRooms,
  currRoomId,
  setCurrRoomId,
}: {
  rooms: { id: string; name: string }[];
  setRooms: (rooms: { id: string; name: string }[]) => void;
  currRoomId: string;
  setCurrRoomId: (id: string) => void;
}) {
  const newRoomNameInputRef = useRef<HTMLInputElement>(null);
  const editRoomNameInputRef = useRef<HTMLInputElement>(null);
  const LIMIT_ROOM_NAME_LEN = 20;

  const [isModalOpen, setIsModalOpen] = useState(false);

  function updateRoomName(roomId: string, newName: string) {
    setRooms(rooms.map((r) => (r.id === roomId ? { ...r, name: newName } : r)));
  }

  function deleteRoom(roomId: string) {
    if (rooms.length === 1 || currRoomId === roomId) return;

    setIsModalOpen(false);
    setRooms(rooms.filter((r) => r.id !== roomId));
  }

  function submitCreateNewRoom() {
    const roomId = crypto.randomUUID();
    setRooms([
      ...rooms,
      {
        id: roomId,
        name: newRoomNameInputRef.current!.value,
      },
    ]);
  }

  return (
    <>
      Room:
      <DropdownMenu open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DropdownMenuTrigger className="border-1 px-2 py-2 text-left justify-between">
          <div>
            <span>
              {limitStrLen(
                rooms.find((r) => r.id === currRoomId)?.name || "",
                LIMIT_ROOM_NAME_LEN,
              ) || "Select Room"}
            </span>
            <FontAwesomeIcon icon={faCaretDown} className="h-4 w-4 ml-2" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-background">
          <ul>
            {rooms.map((room) => (
              <li key={room.id} className="flex px-2 py-1">
                <button
                  onClick={() => {
                    setCurrRoomId(room.id);
                    setIsModalOpen(false);
                  }}
                  className="w-full text-left hover:opacity-80 hover:cursor-pointer"
                >
                  {limitStrLen(room.name, LIMIT_ROOM_NAME_LEN)}
                </button>

                <Dialog>
                  <DialogTrigger>
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="h-4 w-4 hover:cursor-pointer hover:opacity-80 mr-1"
                    />
                  </DialogTrigger>
                  <DialogContent>
                    <DialogTitle>Edit Room Name</DialogTitle>
                    <input
                      type="text"
                      defaultValue={room.name}
                      ref={editRoomNameInputRef}
                    />
                    <DialogClose asChild>
                      <button
                        title="Submit New Room Name"
                        className="text-center relative ml-auto mr-auto mt-1 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80 px-2 py-1"
                        onClick={() =>
                          updateRoomName(
                            room.id,
                            editRoomNameInputRef.current!.value,
                          )
                        }
                      >
                        Submit
                      </button>
                    </DialogClose>
                  </DialogContent>
                </Dialog>

                <button>
                  <FontAwesomeIcon
                    icon={faTrash}
                    className="h-4 w-4 text-[var(--color-red-latrobe)] hover:cursor-pointer hover:opacity-80"
                    onClick={() => deleteRoom(room.id)}
                  />
                </button>
              </li>
            ))}
          </ul>
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                title="Create New Room"
                className="text-center w-full bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80 px-2 py-1 my-1"
              >
                Create New Room
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>Create New Room</DialogTitle>
              <input type="text" ref={newRoomNameInputRef} />
              <DialogClose asChild>
                <button
                  onClick={() => submitCreateNewRoom()}
                  className="text-center relative ml-auto mr-auto mt-1 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80 px-2 py-1"
                >
                  Submit
                </button>
              </DialogClose>
            </DialogContent>
          </Dialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

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
  const {
    rooms,
    setRooms,
    currRoomId,
    setCurrRoomId,
    bgImgUrl,
    questions,
    setQuestions,
    setBgImgUrl,
    hasAttemptedRestore,
    isRestoring,
    imgSize,
    setImgSize,
    save,
  } = useDbAndS3();

  useEffect(() => {
    if (!hasAttemptedRestore || isRestoring || rooms.length > 0) return;

    const newRoomId = crypto.randomUUID();
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

    if (!response.ok) {
      alert("Failed to generate preview URL");
      return;
    }

    const url = `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_S3_PREFIX_FINISHED_ROOMS}/${process.env.NEXT_PUBLIC_S3_ESCAPE_ROOM_HTML_FINISHED_KEY}`;
    window.open(url, "_blank");
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
            <RoomSelector
              rooms={rooms}
              setRooms={setRooms}
              currRoomId={currRoomId}
              setCurrRoomId={setCurrRoomId}
            />
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
            imgSize={imgSize}
            setImgSize={setImgSize}
          />
        </div>
      )}
    </div>
  );
}
