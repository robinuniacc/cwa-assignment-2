import { openDB } from "idb";
import { useState, useEffect, useCallback } from "react";
import { Question } from "@/app/escape-room/typings";

const DEFAULT_IMG_SIZE = { width: 0, height: 0 };
const DEFAULT_TIME_LIMIT_MINUTES = 5;

type EscapeRoomDBEntry = {
  id: string;
  name: string;
  bgImg: Blob;
  imgSize?: { width: number; height: number };
  questions?: Question[];
  timeLimitMinutes?: number;
};

async function getDBTransaction() {
  const db = await openDB<{ "escape-room": Array<EscapeRoomDBEntry> }>(
    "escape-room-db",
    1,
    {
      upgrade(db) {
        if (!db.objectStoreNames.contains("escape-room")) {
          db.createObjectStore("escape-room", { keyPath: "id" });
        }
      },
    },
  );
  return db.transaction("escape-room", "readwrite");
}

// Handles loading/storing the escape room's bg img and questions from/to browser storage
// Img is stored in IndexedDB -- questions in localStorage
export default function useBrowserStorage() {
  const [bgImgUrl, setBgImgUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [imgSize, setImgSize] = useState(DEFAULT_IMG_SIZE);
  const [currRoomId, setCurrRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(
    DEFAULT_TIME_LIMIT_MINUTES,
  );

  const unpureSetRooms = useCallback(
    async (newRooms: { id: string; name: string }[]) => {
      const idRoomsToDelete = rooms
        .filter((r) => !newRooms.find((nr) => nr.id === r.id))
        .map((r) => r.id);
      const tx = await getDBTransaction();
      const store = tx.objectStore("escape-room");
      for (const id of idRoomsToDelete) {
        await store.delete(id);
      }

      // Upsert
      for (const room of newRooms) {
        let existing = await store.get(room.id);
        if (!existing) {
          existing = {
            bgImg: new Blob(),
            imgSize: DEFAULT_IMG_SIZE,
            questions: [],
            timeLimitMinutes: DEFAULT_TIME_LIMIT_MINUTES,
          };
        }
        await store.put({ ...existing, ...room });
      }

      setRooms(newRooms);

      await tx.done;
    },
    [rooms],
  );

  const save = useCallback(async () => {
    if (!currRoomId) return;

    const bgImg = bgImgUrl
      ? await fetch(bgImgUrl).then((r) => r.blob())
      : new Blob();

    const tx = await getDBTransaction();
    const store = tx.objectStore("escape-room");

    const existing = await store.get(currRoomId);
    const roomNewData = {
      id: currRoomId,
      ...existing,
      ...{ bgImg, imgSize, questions, timeLimitMinutes },
    };
    await store.put(roomNewData);

    await tx.done;
  }, [bgImgUrl, currRoomId, imgSize, questions, timeLimitMinutes]);

  // Retrieve room data when currRoomId changes
  useEffect(() => {
    if (!currRoomId) return;

    async function fetchRoomData() {
      const tx = await getDBTransaction();
      const store = tx.objectStore("escape-room");
      const roomData = (await store.get(currRoomId!)) as EscapeRoomDBEntry;
      if (roomData) {
        if (roomData.bgImg.size > 0) {
          const url = URL.createObjectURL(roomData.bgImg);
          setBgImgUrl(url);
        } else {
          setBgImgUrl(null);
        }
        setImgSize(roomData.imgSize || DEFAULT_IMG_SIZE);
        setQuestions(roomData.questions || []);
        setTimeLimitMinutes(
          roomData.timeLimitMinutes || DEFAULT_TIME_LIMIT_MINUTES,
        );
      } else {
        setBgImgUrl(null);
        setImgSize(DEFAULT_IMG_SIZE);
        setQuestions([]);
        setTimeLimitMinutes(DEFAULT_TIME_LIMIT_MINUTES);
      }

      await tx.done;
    }

    fetchRoomData();
  }, [currRoomId]);

  // Restore from browser storage on mount
  useEffect(() => {
    if (hasAttemptedRestore || isRestoring) return;

    setIsRestoring(true);
    async function restore() {
      const tx = await getDBTransaction();
      const store = tx.objectStore("escape-room");

      const allRooms = await store.getAll();
      if (allRooms.length > 0) {
        setRooms(allRooms.map((r) => ({ id: r.id, name: r.name || "Room" })));
        const firstRoom = allRooms[0];
        setCurrRoomId(firstRoom.id);
      }

      await tx.done;

      setHasAttemptedRestore(true);
      setIsRestoring(false);
    }

    restore();
  }, [hasAttemptedRestore, isRestoring]);

  return {
    rooms,
    setRooms: unpureSetRooms,
    currRoomId,
    setCurrRoomId,
    timeLimitMinutes,
    setTimeLimitMinutes,
    bgImgUrl,
    setBgImgUrl,
    imgSize,
    setImgSize,
    questions,
    setQuestions,
    hasAttemptedRestore,
    isRestoring,
    save,
  };
}
