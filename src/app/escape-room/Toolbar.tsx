"use client";
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
import { useRef, useState } from "react";
import { cn, limitStrLen } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../components/shadcn/dropdown-menu";
import { Question } from "./typings";

const LIMIT_ROOM_NAME_LEN = 20;

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
    <div>
      <span className="font-semibold mr-4">Room:</span>
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
    </div>
  );
}

function InstructionsDialog({ className }: { className?: string }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 bg-[var(--color-red-latrobe)] text-white rounded hover:cursor-pointer hover:opacity-80",
            className,
          )}
          title="Instructions Panel"
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
      title="Use Default Image Panel"
    >
      Use Default Image
    </button>
  );
}

function ChooseImagePanel({
  handleBgImgChange,
  handleDeleteImage,
}: {
  handleBgImgChange: (url: string) => void;
  handleDeleteImage: () => void;
}) {
  return (
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
    </form>
  );
}

export default function Toolbar({
  rooms,
  setRooms,
  currRoomId,
  setCurrRoomId,
  bgImgUrl,
  timeLimitMinutes,
  setTimeLimitMinutes,
  handleBgImgChange,
  handleDeleteImage,
  questions,
  imgSize,
  save,
}: {
  rooms: { id: string; name: string }[];
  setRooms: (rooms: { id: string; name: string }[]) => void;
  currRoomId: string | null;
  setCurrRoomId: (id: string) => void;
  bgImgUrl: string | null;
  timeLimitMinutes: number;
  setTimeLimitMinutes: (minutes: number) => void;
  handleBgImgChange: (url: string) => void;
  handleDeleteImage: () => void;
  questions: Question[];
  imgSize: { width: number; height: number } | null;
  save: () => void;
}) {
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
        roomId: currRoomId,
        timeLimitMinutes,
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

    const url = await response.text();
    window.open(url, "_blank");
  }

  return (
    <div className="grid grid-cols-2 text-sm mb-4 [&>div]:border-1 [&>div]:border-foreground/25 [&>div]:p-6">
      <div className="[&>*]:my-2 flex flex-col items-center">
        <RoomSelector
          rooms={rooms}
          setRooms={setRooms}
          currRoomId={currRoomId!}
          setCurrRoomId={setCurrRoomId}
        />
        <form>
          <label>Time</label>
          <input
            type="number"
            className="ml-2 w-16 text-center border-2 border-[var(--color-red-latrobe)] rounded-4xl"
            value={timeLimitMinutes === 0 ? "" : timeLimitMinutes}
            onChange={(e) => {
              setTimeLimitMinutes(Number(e.target.value));
            }}
            onBlur={(e) => {
              setTimeLimitMinutes(
                Math.max(1, Math.min(120, Number(e.target.value))),
              );
            }}
          />{" "}
          minutes
        </form>
        <div className="flex justify-center gap-2">
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
        </div>
      </div>
      <div>
        <ChooseImagePanel
          handleBgImgChange={handleBgImgChange}
          handleDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  );
}

export { InstructionsDialog, UseDefaultImgButton, ChooseImagePanel };
