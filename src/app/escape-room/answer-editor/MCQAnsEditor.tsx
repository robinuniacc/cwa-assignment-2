import { useContext, useEffect, useState } from "react";
import { MultipleChoiceQuestion } from "../typings";
import { EditorContext } from "../workSpaceContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons/faAdd";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

const NEW_CHOICE_PLACEHOLDER = "(new choice)";

function generateChoiceId(choice: string) {
  return `${choice}-${uuidv4()}`;
}

function Choice({
  choice,
  onChoiceChanged,
  deleteChoice,
}: {
  choice: ChoiceWidthId;
  onChoiceChanged: (choice: {
    id: string;
    text?: string;
    isCorrect?: boolean;
  }) => void;
  deleteChoice: (choiceId: string) => void;
}) {
  return (
    <>
      <input
        className="w-full text-left py-2 px-4"
        value={choice.text}
        onChange={(e) => onChoiceChanged({ ...choice, text: e.target.value })}
      />
      <button
        className={cn(
          "py-1 px-2 rounded h-fit hover:opacity-50 hover:cursor-pointer",
          choice.isCorrect && "bg-green-400 dark:bg-green-700 ",
        )}
        onClick={() =>
          onChoiceChanged({ ...choice, isCorrect: !choice.isCorrect })
        }
      >
        Y
      </button>
      <button
        className="cursor-pointer hover:opacity-75 bg-[var(--color-red-latrobe)] text-xs text-white p-2 rounded"
        onClick={() => deleteChoice(choice.id)}
      >
        <FontAwesomeIcon icon={faTrash} />
      </button>
    </>
  );
}
type ChoiceWidthId = MultipleChoiceQuestion["choices"][number] & {
  id: string;
};

export default function MCQAnsEditor({
  question,
  registerOnClose,
  deregisterOnClose,
}: {
  question: MultipleChoiceQuestion;
  registerOnClose: (fn: () => void) => void;
  deregisterOnClose: (fn: () => void) => void;
}) {
  const { updateQuestion } = useContext(EditorContext);
  const [choices, setChoices] = useState<ChoiceWidthId[]>(
    question.choices.map((c) => ({
      id: generateChoiceId(c.text),
      text: c.text,
      isCorrect: c.isCorrect,
    })),
  );

  useEffect(() => {
    const updateChoices = () => {
      // Make sure there is at least one choice
      if (choices.length === 0) {
        choices.push({
          id: generateChoiceId(NEW_CHOICE_PLACEHOLDER),
          text: NEW_CHOICE_PLACEHOLDER,
          isCorrect: true,
        });
      }

      // Make sure at least one choice is correct
      if (!choices.some((c) => c.isCorrect) && choices.length > 0) {
        choices[0].isCorrect = true;
      }
      updateQuestion(question.id, {
        choices: choices.map((c) => ({ text: c.text, isCorrect: c.isCorrect })),
      });
    };

    registerOnClose(updateChoices);
    return () => deregisterOnClose(updateChoices);
  }, [choices, deregisterOnClose, question, registerOnClose, updateQuestion]);

  function createNewChoice(): void {
    setChoices([
      ...choices,
      {
        id: generateChoiceId(NEW_CHOICE_PLACEHOLDER),
        text: NEW_CHOICE_PLACEHOLDER,
        isCorrect: false,
      },
    ]);
  }

  function onChoiceChanged(choice: {
    id: string;
    text?: string;
    isCorrect?: boolean;
  }): void {
    setChoices(
      choices.map((c) => (c.id === choice.id ? { ...c, ...choice } : c)),
    );
  }

  function deleteChoice(choiceId: string): void {
    setChoices(choices.filter((c) => c.id !== choiceId));
  }

  return (
    <div>
      Actual Answer:
      <ul>
        {choices.map((choice) => (
          <li key={choice.id} className="flex items-center gap-2">
            <Choice
              choice={choice}
              onChoiceChanged={onChoiceChanged}
              deleteChoice={deleteChoice}
            />
          </li>
        ))}
      </ul>
      <button
        className="w-full text-center py-2 px-4 cursor-pointer hover:opacity-75"
        onClick={() => createNewChoice()}
      >
        <FontAwesomeIcon icon={faAdd} className="opacity-70" />
      </button>
    </div>
  );
}
