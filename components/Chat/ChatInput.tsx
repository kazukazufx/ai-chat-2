"use client";

import { useState, KeyboardEvent } from "react";
import { SendIcon } from "../UI/Icons";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (trimmed && !disabled) {
      onSend(trimmed);
      setInput("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--chat-bg)]">
      <div className="max-w-3xl mx-auto p-4">
        <div className="relative flex items-end gap-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-xl p-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent outline-none resize-none max-h-32 placeholder:opacity-50"
            style={{ minHeight: "24px" }}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-center mt-2 opacity-50">
          Shift + Enter で改行
        </p>
      </div>
    </div>
  );
}
