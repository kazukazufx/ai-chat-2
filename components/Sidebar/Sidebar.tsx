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
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  isOpen,
  onClose,
}: SidebarProps) {
  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${!isOpen ? "md:hidden" : ""}
        `}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">新しいチャット</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
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
    </>
  );
}
