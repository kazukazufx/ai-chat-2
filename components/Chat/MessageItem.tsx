"use client";

import { useState } from "react";
import Image from "next/image";
import { Message } from "@/types";

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
              <div className="prose prose-sm max-w-none dark:prose-invert whitespace-pre-wrap">
                {message.content}
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
