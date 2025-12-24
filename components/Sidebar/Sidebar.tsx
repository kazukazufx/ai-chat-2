"use client";

import { Conversation } from "@/types";
import { ConversationList } from "./ConversationList";
import { ThemeToggle } from "../UI/ThemeToggle";
import { PlusIcon } from "../UI/Icons";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
}: SidebarProps) {
  return (
    <aside className="w-64 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border-color)] flex flex-col">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--sidebar-hover)] transition-colors"
        >
          <PlusIcon className="w-4 h-4" />
          <span className="text-sm">新しいチャット</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        <ConversationList
          conversations={conversations}
          activeId={activeId}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      </div>

      <div className="p-3 border-t border-[var(--border-color)]">
        <div className="flex items-center justify-between">
          <span className="text-sm opacity-70">AI Chat</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
