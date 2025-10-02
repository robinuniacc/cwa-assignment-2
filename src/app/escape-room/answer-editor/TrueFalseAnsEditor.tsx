import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/shadcn/select";
import { TrueFalseQuestion } from "../typings";
import { useContext, useEffect, useState } from "react";
import { EditorContext } from "../workSpaceContext";

export default function TrueFalseAnsEditor({
  question,
  registerOnClose,
  deregisterOnClose,
}: {
  question: TrueFalseQuestion;
  registerOnClose: (fn: () => void) => void;
  deregisterOnClose: (fn: () => void) => void;
}) {
  const [answer, setAnswer] = useState<string>(
    question.answer ? "true" : "false",
  );

  const { updateQuestion } = useContext(EditorContext);
  useEffect(() => {
    function updateAnswer() {
      updateQuestion(question.id, {
        answer: answer === "true",
      });
    }

    registerOnClose(updateAnswer);
    return () => deregisterOnClose(updateAnswer);
  }, [deregisterOnClose, question.id, registerOnClose, answer, updateQuestion]);

  function onAnswerChange(value: string) {
    setAnswer(value);
  }

  return (
    <div className="grid gap-3">
      Actual Answer:
      <Select onValueChange={onAnswerChange} value={answer}>
        <SelectTrigger className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background hover:cursor-pointer rounded-2xl">
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
