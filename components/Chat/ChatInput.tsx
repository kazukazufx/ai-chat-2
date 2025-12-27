"use client";

import { useState, useRef, KeyboardEvent, ChangeEvent, DragEvent } from "react";
import { SendIcon } from "../UI/Icons";

interface ImageData {
  base64: string;
  type: string;
  name: string;
}

interface FileData {
  base64: string;
  type: string;
  name: string;
}

interface ChatInputProps {
  onSend: (message: string, images?: ImageData[], files?: FileData[]) => void;
  disabled?: boolean;
}

const SUPPORTED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
  "application/json",
  "text/html",
  "text/css",
  "text/javascript",
  "application/javascript",
];

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<ImageData[]>([]);
  const [files, setFiles] = useState<FileData[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmed = input.trim();
    if ((trimmed || images.length > 0 || files.length > 0) && !disabled) {
      onSend(
        trimmed,
        images.length > 0 ? images : undefined,
        files.length > 0 ? files : undefined
      );
      setInput("");
      setImages([]);
      setFiles([]);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;

    const newImages: ImageData[] = [];

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      if (!file.type.startsWith("image/")) continue;

      const base64 = await fileToBase64(file);
      newImages.push({
        base64,
        type: file.type,
        name: file.name,
      });
    }

    setImages((prev) => [...prev, ...newImages]);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const inputFiles = e.target.files;
    if (!inputFiles) return;

    const newFiles: FileData[] = [];

    for (let i = 0; i < inputFiles.length; i++) {
      const file = inputFiles[i];
      if (!SUPPORTED_FILE_TYPES.includes(file.type)) continue;

      const base64 = await fileToBase64(file);
      newFiles.push({
        base64,
        type: file.type,
        name: file.name,
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
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
        // Remove data:xxx;base64, prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
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

    const droppedFiles = e.dataTransfer.files;
    if (!droppedFiles || droppedFiles.length === 0) return;

    const newImages: ImageData[] = [];
    const newFiles: FileData[] = [];

    for (let i = 0; i < droppedFiles.length; i++) {
      const file = droppedFiles[i];

      if (file.type.startsWith("image/")) {
        const base64 = await fileToBase64(file);
        newImages.push({
          base64,
          type: file.type,
          name: file.name,
        });
      } else if (SUPPORTED_FILE_TYPES.includes(file.type)) {
        const base64 = await fileToBase64(file);
        newFiles.push({
          base64,
          type: file.type,
          name: file.name,
        });
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }
    if (newFiles.length > 0) {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type === "application/pdf") {
      return (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zm-3 9h2v5h-2v-5zm-2 2h1v3H8v-3zm6 0h1v3h-1v-3z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
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

        {/* File Preview */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group flex items-center gap-2 px-3 py-2 bg-[var(--sidebar-bg)] rounded-lg border border-[var(--border-color)]"
              >
                {getFileIcon(file.type)}
                <span className="text-sm max-w-32 truncate">{file.name}</span>
                <button
                  onClick={() => removeFile(index)}
                  className="w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
            onClick={() => imageInputRef.current?.click()}
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
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          {/* File Upload Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors disabled:opacity-50"
            title="ファイルを追加 (PDF, TXT, etc.)"
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
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,.csv,.json,.html,.css,.js"
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
            disabled={(!input.trim() && images.length === 0 && files.length === 0) || disabled}
            className="p-2 rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            <SendIcon className="w-4 h-4" />
          </button>
        </div>
        <p className="text-xs text-center mt-2 opacity-50">
          Shift + Enter で改行 ・ ファイルをドラッグ&ドロップまたはクリックで追加
        </p>
      </div>
    </div>
  );
}
