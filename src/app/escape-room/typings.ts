type Type =
  | "short-answer"
  | "multiple-choice"
  | "true-false"
  | "fill-in-the-blanks";

type TextPrompt = {
  type: "text";
  prompt: string;
};
type CodePrompt = {
  type: "code";
  prompt: string;
};
type NewlinePrompt = {
  type: "newline";
  prompt: "";
};
type Prompt = TextPrompt | CodePrompt | NewlinePrompt;

type BaseQuestion = {
  id: string;
  type: Type;
  position: { centerX: number; centerY: number }; // Position on the image
};

type ShortAnswerQuestion = BaseQuestion & {
  type: "short-answer";
  prompt: Prompt[];
  answer: string;
};

type MultipleChoiceQuestion = BaseQuestion & {
  type: "multiple-choice";
  prompt: Prompt[];
  choices: { text: string; isCorrect: boolean }[];
};

type TrueFalseQuestion = BaseQuestion & {
  type: "true-false";
  prompt: Prompt[];
  answer: boolean;
};

// Uses %%% to denote blanks
type FillInTheBlanksPrompt = Prompt;
type FillInTheBlanksQuestion = BaseQuestion & {
  type: "fill-in-the-blanks";
  prompt: FillInTheBlanksPrompt[]; // e.g., "The capital of France is %%%."
  answer: string[];
};

type Question =
  | ShortAnswerQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillInTheBlanksQuestion;

export type {
  ShortAnswerQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  FillInTheBlanksQuestion,
  Question,
  Prompt,
  FillInTheBlanksPrompt,
};
