import {
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { Question } from "@/app/escape-room/typings";
import { loadData, saveData as saveUserData } from "../server-actions/mutator";

export default function useDbStoreAndS3() {
  const [bgImgUrl, setBgImgUrl] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [hasAttemptedRestore, setHasAttemptedRestore] = useState(false);
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const latestData = useRef({ bgImgUrl, questions, imgSize });
  const save = useCallback(async () => {
    if (!latestData.current || !latestData.current.bgImgUrl) return;
    fetch(latestData.current.bgImgUrl)
      .then((res) => res.blob())
      .then((bgImgBlob) => {
        saveUserData({
          imgSize: latestData.current.imgSize,
          questions: latestData.current.questions,
          bgImgBlob,
        });
      });
  }, []);

  function updateState(
    questions: Question[] | undefined,
    bgImgUrl: string | undefined,
    imgSize: { width: number; height: number } | undefined,
  ) {
    if (questions) {
      setQuestions(questions);
      latestData.current.questions = questions;
    }
    if (bgImgUrl) {
      setBgImgUrl(bgImgUrl);
      latestData.current.bgImgUrl = bgImgUrl;
    }
    if (imgSize) {
      setImgSize(imgSize);
      latestData.current.imgSize = imgSize;
    }
  }

  useEffect(() => {
    if (!hasAttemptedRestore) {
      loadData().then((data) => {
        const bgImgUrl = data.bgImgBlob
          ? URL.createObjectURL(data.bgImgBlob)
          : undefined;
        updateState(data.questions, bgImgUrl, data.imgSize);
        setHasAttemptedRestore(true);
      });
    }

    return () => {
      save();
    };
  }, [hasAttemptedRestore, save]);

  return {
    bgImgUrl,
    setBgImgUrl: (url: string | null) => {
      setBgImgUrl(url);
      if (url == null) return;
      latestData.current.bgImgUrl = url as string;
    },
    questions,
    setQuestions: (qs: SetStateAction<Question[]>) => {
      setQuestions(qs);
      latestData.current.questions = qs as Question[];
    },
    hasAttemptedRestore,
    imgSize,
    setImgSize,
    save,
  };
}
