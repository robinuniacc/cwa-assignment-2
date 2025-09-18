type ShortAnswerQuestion = {
  prompt: string;
  answer: string;
  options: Opts;
};

type MultipleChoiceQuestion = {
  prompt: string;
  choices: string[];
  answer: string;
  options: Opts;
};

type TrueFalseQuestion = {
  prompt: string;
  answer: boolean;
  options: Opts;
};

// Uses %%% to denote blanks
type FillInTheBlanksPrompt = string;

type FillInTheBlanksQuestion = {
  prompt: FillInTheBlanksPrompt; // e.g., "The capital of France is ____."
  answer: string[];
  options: Opts;
};

type CodingLanguage =
  | "javascript"
  | "python"
  | "java"
  | "cpp"
  | "ruby"
  | "go"
  | "csharp";
type Opts = {
  isCode?: boolean;
  codeLanguage?: CodingLanguage;
};

type Question = {
  id: string;
  type: "multiple-choice" | "short-answer" | "true-false";
  prompt: string;
  options?: string[]; // For multiple-choice questions
  answer: string | boolean; // String for short-answer, boolean for true-false
  position: { centerX: number; centerY: number }; // Position on the image
};

export type {
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInTheBlanksQuestion,
  FillInTheBlanksPrompt,
  CodingLanguage,
  Opts,
  Question,
};
