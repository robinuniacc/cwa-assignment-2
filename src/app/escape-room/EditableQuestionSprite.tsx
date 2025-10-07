import { useContext, useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/shadcn/select";
import BaseSprite from "./EmptyQuestionSprite";
import { Prompt, Question } from "./typings";
import { EditorContext } from "./workSpaceContext";
import PromptsEditor, {
  computePromptId,
  PromptWithId,
} from "./prompt-editor/PromptsEditor";
import TrueFalseAnsEditor from "./answer-editor/TrueFalseAnsEditor";
import ShortAnswerQEditor from "./answer-editor/ShortAnswerQAnsEditor";
import MCQAnsEditor from "./answer-editor/MCQAnsEditor";
import FITBQAnsEditor from "./answer-editor/FITBQAnsEditor";

const DEFAULT_QUESTIONS: {
  [T in Question["type"]]: Omit<
    Extract<Question, { type: T }>,
    "id" | "position"
  >;
} = {
  "short-answer": {
    type: "short-answer",
    prompt: [{ type: "text", prompt: "What is your answer?" }],
    answer: "Answer here",
  },
  "multiple-choice": {
    type: "multiple-choice",
    prompt: [{ type: "text", prompt: "What is my favorite color?" }],
    choices: [
      { text: "Red", isCorrect: true },
      { text: "Blue", isCorrect: false },
      { text: "Green", isCorrect: true },
    ],
  },
  "true-false": {
    type: "true-false",
    prompt: [{ type: "text", prompt: "The sky is blue." }],
    answer: true,
  },
  "fill-in-the-blanks": {
    type: "fill-in-the-blanks",
    prompt: [
      { type: "text", prompt: "The capital of France is %%%." },
      { type: "text", prompt: "It's located in %%%." },
    ],
    answer: ["Paris", "Europe"],
  },
};

function renderAnswerEditor(
  question: Question,
  {
    registerOnClose,
    deregisterOnClose,
  }: {
    registerOnClose: (fn: () => void) => void;
    deregisterOnClose: (fn: () => void) => void;
  },
) {
  switch (question.type) {
    case "short-answer":
      return (
        <ShortAnswerQEditor
          question={question}
          registerOnClose={registerOnClose}
          deregisterOnClose={deregisterOnClose}
        />
      );
    case "multiple-choice":
      return (
        <MCQAnsEditor
          question={question}
          registerOnClose={registerOnClose}
          deregisterOnClose={deregisterOnClose}
        />
      );
    case "true-false":
      return (
        <TrueFalseAnsEditor
          question={question}
          registerOnClose={registerOnClose}
          deregisterOnClose={deregisterOnClose}
        />
      );
    case "fill-in-the-blanks":
      return (
        <FITBQAnsEditor
          question={question}
          registerOnClose={registerOnClose}
          deregisterOnClose={deregisterOnClose}
        />
      );
    default:
      return null;
  }
}

export default function EditableQuestionSprite({
  question,
  isHighlighted = false,
  defaultOpen = false,
}: {
  question: Question;
  isHighlighted: boolean;
  defaultOpen: boolean;
}) {
  const onCloseListeners = useRef<(() => void)[]>([]);
  const fireOnClose = useRef<() => void>(() => {
    onCloseListeners.current.forEach((f) => f());
  });

  const { updateQuestion } = useContext(EditorContext);
  const [localPrompt, setLocalPrompt] = useState<PromptWithId[]>(() =>
    question.prompt.map((p) => ({ ...p, promptId: computePromptId(p) })),
  );

  useEffect(() => {
    if (question.type !== "fill-in-the-blanks") return;
    const blanksCt = computeBlanksCt(combineTextBasedPrompts(localPrompt));

    const currAns = question.answer;
    if (currAns.length === blanksCt) return;

    const newAns = [...currAns];
    if (blanksCt < currAns.length) newAns.length = blanksCt;
    else {
      while (newAns.length < blanksCt) newAns.push("a");
    }

    updateQuestion(question.id, { ...question, answer: newAns });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localPrompt, question.id, question.type]);

  useEffect(() => {
    setLocalPrompt(
      question.prompt.map((p) => ({ ...p, promptId: computePromptId(p) })),
    );
  }, [question.prompt]);

  useEffect(() => {
    const updatePrompt = () => {
      updateQuestion(question.id, {
        prompt: localPrompt.map(
          (p) => ({ type: p.type, prompt: p.prompt }) as Prompt,
        ),
      });
    };
    onCloseListeners.current.push(updatePrompt);

    return () => {
      onCloseListeners.current = onCloseListeners.current.filter(
        (f) => f !== updatePrompt,
      );
    };
  }, [localPrompt, question.id, updateQuestion]);

  function onQuestionChange(newType: Question["type"]) {
    updateQuestion(question.id, {
      ...DEFAULT_QUESTIONS[newType],
      id: question.id,
      position: question.position,
      prompt: localPrompt.map(
        (p) => ({ type: p.type, prompt: p.prompt }) as Prompt,
      ),
    });
  }

  return (
    <BaseSprite
      isHighlighted={isHighlighted}
      defaultOpen={defaultOpen}
      question={question}
      onClose={fireOnClose.current}
    >
      <Select onValueChange={onQuestionChange} value={question.type}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-background hover:cursor-pointer rounded-2xl">
          <SelectItem value="short-answer">Short Answer</SelectItem>
          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
          <SelectItem value="true-false">True False</SelectItem>
          <SelectItem value="fill-in-the-blanks">Fill In The Blanks</SelectItem>
        </SelectContent>
      </Select>
      <PromptsEditor prompt={localPrompt} setPrompt={setLocalPrompt} />
      {renderAnswerEditor(question, {
        registerOnClose: (f) => onCloseListeners.current.push(f),
        deregisterOnClose: (target: () => void) => {
          onCloseListeners.current = onCloseListeners.current.filter(
            (f) => f !== target,
          );
        },
      })}
    </BaseSprite>
  );
}

function combineTextBasedPrompts(prompt: PromptWithId[]): string {
  return prompt
    .filter((p) => p.type === "text" || p.type === "code")
    .map((p) => p.prompt)
    .join("");
}

function computeBlanksCt(prompt: string): number {
  const regex = /%%%/g;
  const matches = prompt.match(regex);
  return matches ? matches.length : 0;
}

export { DEFAULT_QUESTIONS };
