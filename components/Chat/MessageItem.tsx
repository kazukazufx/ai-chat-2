"use client";

import { useState } from "react";
import Image from "next/image";
import { Message } from "@/types";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageItemProps {
  message: Message;
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === "user";
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  return (
    <>
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
              {/* Display images if any */}
              {message.images && message.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setExpandedImage(img.url)}
                      className="relative group w-32 h-32 sm:w-48 sm:h-48"
                    >
                      <Image
                        src={img.url}
                        alt="添付画像"
                        fill
                        sizes="(max-width: 640px) 128px, 192px"
                        className="object-cover rounded-lg border border-[var(--border-color)] hover:opacity-90 transition-opacity cursor-pointer"
                        unoptimized
                      />
                    </button>
                  ))}
                </div>
              )}
              {/* Display files if any */}
              {message.files && message.files.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {message.files.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 px-3 py-2 bg-[var(--sidebar-bg)] rounded-lg border border-[var(--border-color)]"
                    >
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm">{file.name}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {isUser ? (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                ) : (
                  <MarkdownRenderer content={message.content} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative w-full h-full max-w-4xl max-h-[90vh]">
            <Image
              src={expandedImage}
              alt="拡大画像"
              fill
              sizes="100vw"
              className="object-contain rounded-lg"
              unoptimized
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setExpandedImage(null);
              }}
              className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}
