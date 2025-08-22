import { generateTabId, Tab } from "@/lib/tab";
import { useEffect } from "react";
import Cookies from "js-cookie";

export default function useLocalStorageTabsInitLoad({
  setTabs,
  setActiveTabId,
}: {
  setTabs: (tabs: Tab[]) => void;
  setActiveTabId: (id: string) => void;
}) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("tabs");
      const savedActive = Cookies.get("activeTabId");
      if (raw) {
        const parsed: Tab[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTabs(parsed);
          const candidate =
            parsed.find((s) => s.id === savedActive)?.id ?? parsed[0].id;
          setActiveTabId(candidate);
          return;
        }
      }
      // Ensure at least one default Tab exists if nothing persisted
      const fresh: Tab = {
        id: generateTabId(),
        title: "Introduction",
        content: "Write the opening of your blog here...",
      };
      setTabs([fresh]);
      setActiveTabId(fresh.id);
    } catch {
      // Safe fallback on any parsing/storage error
    }
  }, []);
}
