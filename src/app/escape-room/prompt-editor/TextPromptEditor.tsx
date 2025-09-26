"use client";

import { PromptWithId } from "./PromptsEditor";
import BaseEditor from "./BaseEditor";
import { useContext } from "react";
import PromptEditorContext from "./promptEditorContext";

export default function TextPromptEditor({ prompt }: { prompt: PromptWithId }) {
  const { onChange } = useContext(PromptEditorContext);

  return (
    <BaseEditor className="flex gap-2" prompt={prompt}>
      <input
        key={prompt.promptId}
        className="text-sm w-full"
        value={prompt.prompt}
        onChange={(e) => onChange(prompt.promptId, e.target.value)}
      />
    </BaseEditor>
  );
}
