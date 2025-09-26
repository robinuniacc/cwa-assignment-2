import { useContext, useEffect } from "react";
import { EditorContext } from "../workSpaceContext";
import { ShortAnswerQuestion } from "../typings";

export default function ShortAnswerQEditor({
  question,
  registerOnClose,
  deregisterOnClose,
}: {
  question: ShortAnswerQuestion;
  registerOnClose: (fn: () => void) => void;
  deregisterOnClose: (fn: () => void) => void;
}) {
  const { updateQuestion } = useContext(EditorContext);
  useEffect(() => {
    function updateAnswer() {
      updateQuestion(question.id, {
        answer: (document.getElementById("answer") as HTMLInputElement).value,
      });
    }

    registerOnClose(updateAnswer);
    return () => deregisterOnClose(updateAnswer);
  }, [deregisterOnClose, question.id, registerOnClose, updateQuestion]);

  return (
    <div className="grid gap-3">
      <label htmlFor="answer">Answer</label>
      <input id="answer" name="answer" defaultValue={question.answer} />
    </div>
  );
}
