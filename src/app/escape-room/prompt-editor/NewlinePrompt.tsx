import { PromptWithId } from "./PromptsEditor";
import BaseEditor from "./BaseEditor";

export default function NewlinePrompt({ prompt }: { prompt: PromptWithId }) {
  return (
    <BaseEditor
      key={prompt.promptId}
      className="flex items-center"
      prompt={prompt}
    >
      <p className="text-xs w-full text-center">
        ................ line break ................
      </p>
    </BaseEditor>
  );
}
