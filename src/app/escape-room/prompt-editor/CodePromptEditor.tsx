"use client";

import { PromptWithId } from "./PromptsEditor";
import { useContext, useEffect, useRef } from "react";
import BaseEditor from "./BaseEditor";
import PromptEditorContext from "./promptEditorContext";

export default function CodePromptEditor({ prompt }: { prompt: PromptWithId }) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  function resizePrompt(e: HTMLTextAreaElement) {
    // Auto-resize textarea
    e.style.height = "";
    e.style.height = e.scrollHeight + "px";
  }

  const { onChange } = useContext(PromptEditorContext);

  useEffect(() => {
    if (textAreaRef.current) {
      resizePrompt(textAreaRef.current);
    }
  }, [prompt]);

  return (
    <BaseEditor className="flex gap-2 items-center" prompt={prompt}>
      <pre
        key={prompt.promptId}
        className="bg-background rounded text-sm overflow-x-auto w-full"
      >
        <code>
          <textarea
            ref={textAreaRef}
            value={prompt.prompt}
            rows={1}
            className="w-full resize-none h-auto"
            onChange={(e) => {
              onChange(prompt.promptId, e.target.value);
            }}
          />
        </code>
      </pre>
    </BaseEditor>
  );
}
