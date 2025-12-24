"use client";

import { Conversation } from "@/types";
import { ChatIcon, TrashIcon } from "../UI/Icons";

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onSelect,
  onDelete,
}: ConversationItemProps) {
  return (
    <div
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
        isActive
          ? "bg-[var(--sidebar-hover)]"
          : "hover:bg-[var(--sidebar-hover)]"
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <ChatIcon className="w-4 h-4 flex-shrink-0 opacity-70" />
      <span className="flex-1 truncate text-sm">{conversation.title}</span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(conversation.id);
        }}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 hover:text-red-500 transition-all"
        aria-label="Delete conversation"
      >
        <TrashIcon className="w-4 h-4" />
      </button>
    </div>
  );
}
