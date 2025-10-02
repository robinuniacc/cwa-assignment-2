import { faGripVertical, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { PromptWithId } from "./PromptsEditor";
import { useContext } from "react";
import PromptEditorContext from "./promptEditorContext";
import { cn } from "@/lib/utils";

export default function BaseEditor({
  prompt,
  children,
  className,
}: {
  prompt: PromptWithId;
  children: React.ReactNode;
  className?: string;
}) {
  const { onDelete, onMovePrompt, draggingPromptIdRef } =
    useContext(PromptEditorContext);

  function handleDragStart() {
    draggingPromptIdRef.current = prompt.promptId;
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();

    const idPromptDragging = draggingPromptIdRef.current;
    if (!idPromptDragging || idPromptDragging === prompt.promptId) return;

    onMovePrompt(idPromptDragging, prompt.promptId);
  }
  function handleDragEnd(e: React.DragEvent) {
    e.preventDefault();
    draggingPromptIdRef.current = null;
  }

  return (
    <div
      id={prompt.promptId}
      className={cn("flex items-center", className)}
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <FontAwesomeIcon icon={faGripVertical} className="text-sm" />
      {children}
      <FontAwesomeIcon
        icon={faTrash}
        className=" bg-[var(--color-red-latrobe)] px-1 py-2 rounded text-white text-sm hover:opacity-80 hover:cursor-pointer"
        onClick={() => onDelete(prompt.promptId)}
      />
    </div>
  );
}
