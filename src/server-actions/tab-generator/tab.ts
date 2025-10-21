import { v4 as uuidv4 } from "uuid";

type Tab = {
  id: string;
  title: string;
  content: string;
};

function generateTabId(): string {
  return uuidv4();
}

export { generateTabId };
export type { Tab };
