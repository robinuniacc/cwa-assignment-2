import { Tab } from "@/server-actions/tab-generator/tab";
import { faPen } from "@fortawesome/free-solid-svg-icons/faPen";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function TabContentEditor({
  className,
  activeTab,
  updateActiveTab,
}: {
  className?: string;
  activeTab: Tab;
  updateActiveTab: (updates: Partial<Pick<Tab, "title" | "content">>) => void;
}) {
  return (
    <div className={className}>
      <label className="block text-sm font-medium">Title</label>
      <div className="flex items-center gap-2">
        <FontAwesomeIcon icon={faPen} className="opacity-70" />
        <input
          value={activeTab?.title ?? ""}
          onChange={(e) => updateActiveTab({ title: e.target.value })}
          placeholder="Tab title"
          className="w-full rounded-md border border-black/[.12] px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-foreground/[.2]"
        />
      </div>

      <label className="block text-sm font-medium mt-4">Content</label>
      <textarea
        value={activeTab?.content ?? ""}
        onChange={(e) => updateActiveTab({ content: e.target.value })}
        placeholder="Write your content..."
        rows={10}
        className="w-full rounded-md border border-black/[.12] px-3 py-2 bg-transparent outline-none focus:ring-2 focus:ring-foreground/[.2]"
      />
    </div>
  );
}
