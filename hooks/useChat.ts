"use client";

import { useState, useCallback } from "react";
import { Message, Conversation } from "@/types";

export function useChat(
  conversation: Conversation | null,
  onConversationUpdate: (conversation: Conversation) => void
) {
  const [messages, setMessages] = useState<Message[]>(
    conversation?.messages || []
  );
  const [isLoading, setIsLoading] = useState(false);

  const setConversation = useCallback((conv: Conversation | null) => {
    setMessages(conv?.messages || []);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isLoading) return;

      const userMessage: Message = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        createdAt: new Date(),
        conversationId: conversation?.id || "",
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

        const assistantMessage: Message = {
          id: `temp-assistant-${Date.now()}`,
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
                if (parsed.content) {
                  assistantContent += parsed.content;
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMessage.id
                        ? { ...m, content: assistantContent }
                        : m
                    )
                  );
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
            title: content.slice(0, 30) + (content.length > 30 ? "..." : ""),
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
    [conversation, isLoading, messages, onConversationUpdate]
  );

  return {
    messages,
    isLoading,
    sendMessage,
    setConversation,
  };
}
