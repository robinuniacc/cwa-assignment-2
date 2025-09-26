import { createContext } from "react";
import { Question } from "./typings";

const EditorContext = createContext<{
  deleteQuestion: (id: string) => void;
  updateQuestion: (id: string, updated: Partial<Question>) => boolean;
}>({
  deleteQuestion: () => {},
  updateQuestion: () => false,
});

export { EditorContext };
