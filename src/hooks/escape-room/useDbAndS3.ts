import { useCallback, useEffect, useRef, useState } from "react";
import { Question } from "@/app/escape-room/typings";
import {
  addOrUpdateRoom,
  deleteRoom,
  loadData,
  saveData as saveUserData,
} from "../../server-actions/escapeRoomExtStoreMutator";

export default function useDbAndS3() {
  const [bgImgUrl, setBgImgUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });
  const [currRoomId, setCurrRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<{ id: string; name: string }[]>([]);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(5);

  const latestData = useRef({
    bgImgUrl,
    questions,
    imgSize,
    currRoomId,
    rooms,
    timeLimitMinutes,
  });

  useEffect(() => {
    latestData.current = {
      bgImgUrl,
      questions,
      imgSize,
      currRoomId,
      rooms,
      timeLimitMinutes,
    };
  }, [bgImgUrl, questions, imgSize, currRoomId, rooms, timeLimitMinutes]);

  const save = useCallback(async () => {
    if (
      !latestData.current ||
      !latestData.current.bgImgUrl ||
      !latestData.current.currRoomId
    )
      return;

    const bgImgUrl = await fetch(latestData.current.bgImgUrl);
    const bgImgBlob = await bgImgUrl.blob();
    await saveUserData({
      room: latestData.current.rooms.find(
        (r) => r.id === latestData.current.currRoomId,
      )!,
      imgSize: latestData.current.imgSize,
      questions: latestData.current.questions,
      bgImgBlob,
      timeLimitMinutes: latestData.current.timeLimitMinutes,
    });
  }, []);

  const initStateToRoomData = useCallback(async (currRoomId: string | null) => {
    const data = await loadData(currRoomId);
    const bgImgUrl = data.bgImgBlob
      ? URL.createObjectURL(data.bgImgBlob)
      : undefined;

    setBgImgUrl(bgImgUrl || null);
    setQuestions(data.questions);
    setImgSize(data.imgSize || { width: 0, height: 0 });
    setRooms(data.rooms);
    setTimeLimitMinutes(data.timeLimitMinutes || 5);

    if (data.rooms.length > 0 && !currRoomId) {
      setCurrRoomId(data.rooms[0].id);
      await initStateToRoomData(data.rooms[0].id);
    }
  }, []);

  useEffect(() => {
    if (!hasAttemptedRestore) {
      setIsRestoring(true);

      initStateToRoomData(null).then(() => {
        setHasAttemptedRestore(true);
        setIsRestoring(false);
      });
    }
  }, [hasAttemptedRestore, initStateToRoomData, save]);

  const returnSetCurrRoomId = useCallback(
    async (roomId: string) => {
      if (roomId === latestData.current.currRoomId) return;
      await save();
      setCurrRoomId(roomId);
      await initStateToRoomData(roomId);
    },
    [initStateToRoomData, save],
  );

  const returnSetRooms = useCallback(
    async (rooms: { id: string; name: string }[]) => {
      // Delete rooms
      for (const r of latestData.current.rooms) {
        if (rooms.find((nr) => nr.id === r.id)) continue;

        await deleteRoom(r.id);
      }

      // Add/update rooms
      for (const r of rooms) {
        await addOrUpdateRoom(r);
      }

      setRooms(rooms);
    },
    [],
  );

  return {
    rooms,
    setRooms: returnSetRooms,
    currRoomId,
    setCurrRoomId: returnSetCurrRoomId,
    bgImgUrl,
    setBgImgUrl,
    timeLimitMinutes,
    setTimeLimitMinutes,
    questions,
    setQuestions,
    isRestoring,
    hasAttemptedRestore,
    imgSize,
    setImgSize,
    save,
  };
}
