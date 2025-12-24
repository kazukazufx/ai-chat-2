"use client";

import { Message } from "@/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";
import { MenuIcon } from "../UI/Icons";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function ChatContainer({
  messages,
  isLoading,
  onSend,
  onToggleSidebar,
  isSidebarOpen,
}: ChatContainerProps) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[var(--chat-bg)]">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border-color)]">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors"
          aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <h1 className="font-semibold">AI Chat</h1>
      </header>

      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
