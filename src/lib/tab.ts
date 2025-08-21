type Tab = {
  id: string;
  title: string;
  content: string;
};

function generateTabId(): string {
  return crypto.randomUUID();
}

export { generateTabId };
export type { Tab };
