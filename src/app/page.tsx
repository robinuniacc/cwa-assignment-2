"use client";

import { useEffect, useMemo, useState } from "react";
import CodePreview from "./components/CodeViewbox";
import TabContentEditor from "./components/TabContentEditor";
import TabNavigationBar from "./components/TabNavigationBar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import useLocalStorageTabsInitLoad from "@/hooks/useLocalStorageTabsInitLoad";
import { setCookie } from "@/lib/web";
import { generateTabId, Tab } from "@/lib/tab";
import { generateHTMLFromTabs } from "@/lib/html";
import Cookies from "js-cookie";

export default function Home() {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: generateTabId(),
      title: "Introduction",
      content: "",
    },
  ]);

  const [activeTabId, setActiveTabId] = useState<string>(tabs[0].id);

  const activeTab = useMemo(
    () => tabs.find((s) => s.id === activeTabId) ?? tabs[0],
    [tabs, activeTabId],
  );

  // Load from localStorage once on mount
  useLocalStorageTabsInitLoad({ setTabs, setActiveTabId });

  // Persist to localStorage whenever tabs or activeId change
  useEffect(() => {
    try {
      localStorage.setItem("tabs", JSON.stringify(tabs));
      Cookies.set("activeTabId", activeTabId ?? "");
    } catch {}
  }, [tabs, activeTabId]);

  // Never allow empty tabs array; recreate a default Tab when last is removed
  useEffect(() => {
    if (tabs.length === 0) {
      const fresh: Tab = {
        id: generateTabId(),
        title: "Untitled Tab",
        content: "",
      };
      setTabs([fresh]);
      setActiveTabId(fresh.id);
    }
  }, [tabs.length]);

  // Keep cookie in sync with currently edited Tab title
  useEffect(() => {
    setCookie("activeTabId", activeTabId);
  }, [activeTabId]);

  const removeTab = (id: string) => {
    // Don't remove if the Tab is the only Tab left
    if (tabs.length === 1) return;
    setTabs((prev) => {
      const index = prev.findIndex((s) => s.id === id);
      const next = prev.filter((s) => s.id !== id);
      if (id === activeTabId) {
        const fallback = next[index] || next[index - 1] || next[0];
        setActiveTabId(fallback ? fallback.id : "");
      }
      return next;
    });
  };

  const addTab = () => {
    const fresh: Tab = {
      id: generateTabId(),
      title: "Untitled Tab",
      content: "",
    };
    setTabs((prev) => [...prev, fresh]);
    setActiveTabId(fresh.id);
  };

  const updateActiveTab = (
    updates: Partial<Pick<Tab, "title" | "content">>,
  ) => {
    setTabs((prev) =>
      prev.map((s) => (s.id === activeTab.id ? { ...s, ...updates } : s)),
    );
  };

  return (
    <div className="min-h-screen p-6 md:p-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-black/[.12]">
          <div className="flex items-center justify-between gap-1 px-3 py-2 border-b border-black/[.08]">
            <TabNavigationBar
              className="flex flex-wrap gap-2 border-foreground"
              tabs={tabs}
              active={activeTab}
              setActiveId={setActiveTabId}
              setTabs={setTabs}
            />

            {/* Add Tab, Remove Tab buttons */}
            <div className="self-start basis-auto grow-0 shrink-0">
              <button
                onClick={addTab}
                className="dark:bg-foreground/5 inline-flex items-center gap-2 px-3 py-2 border border-black/[.12] hover:bg-black/[.04] transition-colors hover:cursor-pointer"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add tab</span>
              </button>
              {activeTab && (
                <button
                  onClick={() => removeTab(activeTab.id)}
                  className="ml-4 text-red-400 hover:text-red-700 hover:cursor-pointer"
                  title="Delete active Tab"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>

          <TabContentEditor
            className="p-4 space-y-3"
            activeTab={activeTab}
            updateActiveTab={updateActiveTab}
          />
        </div>

        <CodePreview htmlContent={generateHTMLFromTabs(tabs)} />
      </div>
    </div>
  );
}
