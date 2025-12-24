"use client";

import { Message } from "@/types";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`py-4 ${
        isUser ? "bg-[var(--user-msg-bg)]" : "bg-[var(--assistant-msg-bg)]"
      }`}
    >
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              isUser ? "bg-blue-600" : "bg-green-600"
            }`}
          >
            <span className="text-white text-sm font-medium">
              {isUser ? "U" : "A"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm mb-1">
              {isUser ? "あなた" : "アシスタント"}
            </div>
            <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
