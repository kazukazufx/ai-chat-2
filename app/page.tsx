"use client";

import { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar/Sidebar";
import { ChatContainer } from "@/components/Chat/ChatContainer";
import { useConversations } from "@/hooks/useConversations";
import { useChat } from "@/hooks/useChat";
import { Conversation } from "@/types";

export default function Home() {
  const {
    conversations,
    createConversation,
    deleteConversation,
    updateConversation,
    refetch,
  } = useConversations();

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const handleConversationUpdate = useCallback(
    (updated: Conversation) => {
      updateConversation(updated);
      setActiveConversation(updated);
      refetch();
    },
    [updateConversation, refetch]
  );

  const { messages, isLoading, sendMessage, setConversation } = useChat(
    activeConversation,
    handleConversationUpdate
  );

  useEffect(() => {
    setConversation(activeConversation);
  }, [activeConversation, setConversation]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      const conversation = conversations.find((c) => c.id === id);
      if (conversation) {
        setActiveConversation(conversation);
      }
    },
    [conversations]
  );

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      const success = await deleteConversation(id);
      if (success && activeConversation?.id === id) {
        setActiveConversation(null);
      }
    },
    [deleteConversation, activeConversation]
  );

  const handleNewChat = useCallback(async () => {
    setActiveConversation(null);
  }, []);

  return (
    <div className="flex h-screen">
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?.id || null}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onNewChat={handleNewChat}
      />
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSend={sendMessage}
      />
    </div>
  );
}
