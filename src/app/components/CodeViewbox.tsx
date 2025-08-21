"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard } from "@fortawesome/free-solid-svg-icons/faClipboard";
import { useState } from "react";

export default function CodePreview({ htmlContent }: { htmlContent: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (copied) return;
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className="rounded-lg border border-foreground/[.12]">
      <div className="px-3 py-2 border-b border-foreground/[.08] flex items-center justify-between">
        <p>HTML Preview</p>
        <button
          onClick={handleCopy}
          disabled={copied}
          className={`ml-2 px-3 py-1 rounded bg-foreground/10 cursor-pointer ${copied ? "bg-green-100 text-green-700 dark:bg-green-600 dark:text-foreground cursor-not-allowed" : "hover:bg-foreground/15"}`}
        >
          {copied ? "Copied" : "Copy"}
          <FontAwesomeIcon icon={faClipboard} className="ml-2" />
        </button>
      </div>
      <div className="p-4 max-h-[50vh] overflow-y-scroll">
        <pre>
          <code suppressHydrationWarning>{htmlContent}</code>
        </pre>
      </div>
    </div>
  );
}
