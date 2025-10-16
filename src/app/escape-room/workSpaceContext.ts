import { createContext } from "react";
import { Question } from "./typings";

const EditorContext = createContext<{
  deleteQuestion: (id: string) => void;
  updateQuestion: (
    id: string,
    updated: Partial<Question>,
  ) => void | React.Dispatch<React.SetStateAction<Question[]>>;
}>({
  deleteQuestion: () => {},
  updateQuestion: () => {},
});

export { EditorContext };
