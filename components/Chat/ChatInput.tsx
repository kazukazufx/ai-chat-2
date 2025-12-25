"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, DragEvent } from "react";
import { SendIcon } from "../UI/Icons";

interface ImageData {
  base64: string;
  type: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string, images?: ImageData[]) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if ((trimmed || images.length > 0) && !disabled) {
      onSend(trimmed, images.length > 0 ? images : undefined);
      setInput("");
      setImages([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const base64 = await fileToBase64(file);
      newImages.push({
        base64,
        type: file.type,
        name: file.name,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/xxx;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newImages: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith("image/")) continue;

      const base64 = await fileToBase64(file);
      newImages.push({
        base64,
        type: file.type,
        name: file.name,
      });
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  return (
    <div className="border-t border-[var(--border-color)] bg-[var(--chat-bg)]">
      <div className="max-w-3xl mx-auto p-4">
        {/* Image Preview */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={`data:${img.type};base64,${img.base64}`}
                  alt={img.name}
                  className="w-20 h-20 object-cover rounded-lg border border-[var(--border-color)]"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div
          className={`relative flex items-end gap-2 bg-[var(--input-bg)] border rounded-xl p-3 transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-500/10"
              : "border-[var(--input-border)]"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Image Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50"
            title="画像を追加"
          >
            <svg
              className="w-5 h-5 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

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
            disabled={(!input.trim() && images.length === 0) || disabled}
            className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-center mt-2 opacity-50">
          Shift + Enter で改行 ・ 画像をドラッグ&ドロップまたはクリックで追加
        </p>
      </div>
    </div>
  );
}
