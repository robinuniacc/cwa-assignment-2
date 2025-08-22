import { Tab } from "@/lib/tab";
import { useState } from "react";

export default function TabNavigationBar({
  tabs,
  setTabs,
  active,
  setActiveId,
  className,
}: {
  tabs: Tab[];
  setTabs?: React.Dispatch<React.SetStateAction<Tab[]>>;
  active: Tab;
  setActiveId: (id: string) => void;
  className?: string;
}) {
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  function handleDragStart(idx: number) {
    setDraggedIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    if (!setTabs) return;
    setTabs((currTabs) => {
      const newTabs = [...currTabs];
      const [removedTab] = newTabs.splice(draggedIdx, 1);
      newTabs.splice(idx, 0, removedTab);
      return newTabs;
    });
    setDraggedIdx(idx);
  }

  function handleDragEnd() {
    setDraggedIdx(null);
  }

  return (
    <div className={className}>
      {tabs.map((Tab, idx) => (
        <button
          key={Tab.id}
          draggable
          onDragStart={() => handleDragStart(idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDragEnd={handleDragEnd}
          onClick={() => setActiveId(Tab.id)}
          className={`text-sm px-3 py-1 rounded-full border ${active?.id === Tab.id ? "bg-foreground text-background border-transparent" : "border-black/[.12] hover:bg-black/[.04]"}`}
          title={Tab.title || "Untitled Tab"}
          style={{ cursor: "grab", opacity: draggedIdx === idx ? 0.5 : 1 }}
        >
          {Tab.title || "Untitled"}
        </button>
      ))}
    </div>
  );
}
