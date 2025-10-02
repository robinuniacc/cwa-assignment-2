import { createContext, RefObject } from "react";
import { PromptWithId } from "./PromptsEditor";

const PromptEditorContext = createContext<{
  onDelete: (promptId: string) => void;
  onChange: (promptId: string, val: string) => void;
  onMovePrompt: (idPromptToMove: string, idPromptToMoveTo: string) => void;
  draggingPromptIdRef: RefObject<PromptWithId["promptId"] | null>;
}>({
  onDelete: () => {},
  onChange: () => {},
  onMovePrompt: () => {},
  draggingPromptIdRef: { current: null },
});

export default PromptEditorContext;
