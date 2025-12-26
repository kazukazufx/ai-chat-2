"use client";

import { useState, useCallback } from "react";
import { Message, MessageImage, Conversation } from "@/types";

interface ImageData {
  base64: string;
  type: string;
  name: string;
}

interface TempImage {
  id: string;
  url: string; // data: URL for preview
  type: string;
}

export function useChat(
  conversation: Conversation | null,
  onConversationUpdate: (conversation: Conversation) => void,
  onTitleUpdate?: (conversationId: string, title: string) => void
) {
  const [messages, setMessages] = useState<Message[]>(
    conversation?.messages || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const setConversation = useCallback((conv: Conversation | null) => {
    setMessages(conv?.messages || []);
  }, []);

  const sendMessage = useCallback(
    async (content: string, images?: ImageData[]) => {
      if (isLoading) return;

      // Create temporary images for preview (using data URLs)
      const tempImages: MessageImage[] = images?.map((img, index) => ({
        id: `temp-img-${Date.now()}-${index}`,
        url: `data:${img.type};base64,${img.base64}`,
        type: img.type,
        createdAt: new Date(),
        messageId: "",
      })) || [];

      const userMessageId = `temp-${Date.now()}`;
      const userMessage: Message = {
        id: userMessageId,
        role: "user",
        content: content || "",
        createdAt: new Date(),
        conversationId: conversation?.id || "",
        images: tempImages.length > 0 ? tempImages : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: conversation?.id,
            message: content,
            images: images?.map((img) => ({
              base64: img.base64,
              type: img.type,
            })),
          }),
        });

        if (!res.ok) {
          throw new Error("Chat request failed");
        }

        const reader = res.body?.getReader();
        if (!reader) {
          throw new Error("No reader available");
        }

        const decoder = new TextDecoder();
        let assistantContent = "";
        let newConversationId = conversation?.id;
        let realUserMessageId = userMessageId;

        const assistantMessageId = `temp-assistant-${Date.now()}`;
        const assistantMessage: Message = {
          id: assistantMessageId,
          role: "assistant",
          content: "",
          createdAt: new Date(),
          conversationId: conversation?.id || "",
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.conversationId) {
                  newConversationId = parsed.conversationId;
                }
                // Update user message with real ID and blob URLs
                if (parsed.userMessageId) {
                  realUserMessageId = parsed.userMessageId;
                  const uploadedImages: MessageImage[] = parsed.images?.map(
                    (img: { id: string; url: string; type: string }) => ({
                      id: img.id,
                      url: img.url,
                      type: img.type,
                      createdAt: new Date(),
                      messageId: parsed.userMessageId,
                    })
                  ) || [];

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === userMessageId
                        ? {
                            ...m,
                            id: parsed.userMessageId,
                            images: uploadedImages.length > 0 ? uploadedImages : m.images,
                          }
                        : m
                    )
                  );
                }
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessageId
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
                }
                if (parsed.title && newConversationId && onTitleUpdate) {
                  onTitleUpdate(newConversationId, parsed.title);
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        if (newConversationId && newConversationId !== conversation?.id) {
          const updatedConversation: Conversation = {
            id: newConversationId,
            title: (content || "画像").slice(0, 30) + ((content || "").length > 30 ? "..." : ""),
            createdAt: new Date(),
            updatedAt: new Date(),
            messages: [
              ...messages,
              userMessage,
              { ...assistantMessage, content: assistantContent },
            ],
          };
          onConversationUpdate(updatedConversation);
        }
      } catch (error) {
        console.error("Chat error:", error);
        setMessages((prev) => [
          ...prev.filter((m) => m.id !== `temp-assistant-${Date.now()}`),
          {
            id: `error-${Date.now()}`,
            role: "assistant",
            content: "エラーが発生しました。もう一度お試しください。",
            createdAt: new Date(),
            conversationId: conversation?.id || "",
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [conversation, isLoading, messages, onConversationUpdate, onTitleUpdate]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    setConversation,
  };
}
