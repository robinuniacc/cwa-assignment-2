import { Prompt } from "../typings";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons/faAdd";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/shadcn/dropdown-menu";
import { useCallback, useRef } from "react";
import CodePromptEditor from "./CodePromptEditor";
import TextPromptEditor from "./TextPromptEditor";
import NewlinePrompt from "./NewlinePrompt";
import PromptEditorContext from "./promptEditorContext";

export function computePromptId(prompt: Prompt): string {
  return `${prompt.prompt}-${crypto.randomUUID()}`;
}

export default function PromptEditor({
  prompt,
  setPrompt,
}: {
  prompt: PromptWithId[];
  setPrompt: (newPrompt: PromptWithId[]) => void;
}) {
  const draggingPromptIdRef = useRef<PromptWithId["promptId"] | null>(null);

  function handleCreatePrompt(type: Prompt["type"]): void {
    setPrompt([
      ...prompt,
      type === "newline"
        ? { type, prompt: "", promptId: computePromptId({ type, prompt: "" }) }
        : {
            type,
            prompt: "new prompt",
            promptId: computePromptId({ type, prompt: "new prompt" }),
          },
    ]);
  }

  function handleDeletePrompt(promptId: string): void {
    if (prompt.length === 1) {
      // always keep at least one prompt
      return;
    }
    setPrompt(prompt.filter((p) => p.promptId !== promptId));
  }

  function handleMovePrompt(
    idPromptToMove: PromptWithId["promptId"],
    idPromptToMoveTo: PromptWithId["promptId"],
  ): void {
    const fromIdx = prompt.findIndex((p) => p.promptId === idPromptToMove);
    const toIdx = prompt.findIndex((p) => p.promptId === idPromptToMoveTo);
    if (fromIdx === -1 || toIdx === -1) return;

    const newPrompt = Array.from(prompt);
    const [p] = newPrompt.splice(fromIdx, 1);
    newPrompt.splice(toIdx, 0, p);
    setPrompt(newPrompt);
  }

  const handleTextBasedPromptChange = useCallback(
    (promptId: string, newVal: string) => {
      setPrompt(
        prompt.map((p) =>
          p.promptId === promptId
            ? ({ ...p, prompt: newVal } as PromptWithId)
            : p,
        ),
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [prompt],
  );

  return (
    <PromptEditorContext
      value={{
        onDelete: handleDeletePrompt,
        onChange: handleTextBasedPromptChange,
        onMovePrompt: handleMovePrompt,
        draggingPromptIdRef,
      }}
    >
      <div className="grid gap-3">
        <div>
          {prompt.map((p) => {
            switch (p.type) {
              case "text":
                return <TextPromptEditor key={p.promptId} prompt={p} />;
              case "code":
                return <CodePromptEditor key={p.promptId} prompt={p} />;
              case "newline":
                return <NewlinePrompt key={p.promptId} prompt={p} />;
              default:
                return null;
            }
          })}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="text-sm">
            Add Prompt Element
            <FontAwesomeIcon icon={faAdd} className="pl-2" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-background rounded-2xl">
            <DropdownMenuItem onSelect={() => handleCreatePrompt("text")}>
              Text
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleCreatePrompt("code")}>
              Code
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleCreatePrompt("newline")}>
              Line Break
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </PromptEditorContext>
  );
}

export type PromptWithId = Prompt & { promptId: string };
