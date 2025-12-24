"use client";

import { Message } from "@/types";
import { MessageList } from "./MessageList";
import { ChatInput } from "./ChatInput";

interface ChatContainerProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
}

export function ChatContainer({
  messages,
  isLoading,
  onSend,
}: ChatContainerProps) {
  return (
    <div className="flex-1 flex flex-col h-screen bg-[var(--chat-bg)]">
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}
