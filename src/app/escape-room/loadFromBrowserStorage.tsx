import { openDB } from "idb";
import { useState, useEffect } from "react";
import { Question } from "./typings";

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

// Handles loading/storing the escape room's bg img and questions from/to browser storage
// Img is stored in IndexedDB -- questions in localStorage
export default function useAttemptRestore() {
  const [bgImgUrl, setBgImgUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 400, height: 400 });

  useEffect(() => {
    if (!hasAttemptedRestore) {
      const savedQuestions = localStorage.getItem("escapeRoomQuestions");
      if (savedQuestions) {
        setQuestions(JSON.parse(savedQuestions));
        const savedImgSize = JSON.parse(localStorage.getItem("bgImgSize")!);
        setImgSize(savedImgSize);
        loadImageFromIndexedDB().then((img) => {
          if (img) {
            setBgImgUrl(URL.createObjectURL(img));
          }
        });
      }
      setHasAttemptedRestore(true);
      return;
    }

    localStorage.setItem("escapeRoomQuestions", JSON.stringify(questions));
    localStorage.setItem("bgImgSize", JSON.stringify(imgSize));
    if (bgImgUrl) {
      async function updateImageInStorage(url: string) {
        const response = await fetch(url);
        saveImageToIndexedDB(await response.blob());
      }
      updateImageInStorage(bgImgUrl);
    }
  }, [
    questions,
    bgImgUrl,
    hasAttemptedRestore,
    imgSize.width,
    imgSize.height,
    imgSize,
  ]);

  return {
    bgImgUrl,
    setBgImgUrl,
    imgSize,
    setImgSize,
    questions,
    setQuestions,
    hasAttemptedRestore,
  };
}
