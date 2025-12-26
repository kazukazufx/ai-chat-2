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
    deleteConversation,
    updateConversation,
    updateConversationTitle,
    refetch,
  } = useConversations();

  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Close sidebar on mobile by default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleConversationUpdate = useCallback(
    (updated: Conversation) => {
      updateConversation(updated);
      setActiveConversation(updated);
      refetch();
    },
    [updateConversation, refetch]
  );

  const handleTitleUpdate = useCallback(
    (conversationId: string, title: string) => {
      updateConversationTitle(conversationId, title);
      if (activeConversation?.id === conversationId) {
        setActiveConversation((prev) => (prev ? { ...prev, title } : null));
      }
    },
    [updateConversationTitle, activeConversation?.id]
  );

  const { messages, isLoading, sendMessage, setConversation } = useChat(
    activeConversation,
    handleConversationUpdate,
    handleTitleUpdate
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

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={activeConversation?.id || null}
        onSelect={handleSelectConversation}
        onDelete={handleDeleteConversation}
        onNewChat={handleNewChat}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />
      <ChatContainer
        messages={messages}
        isLoading={isLoading}
        onSend={sendMessage}
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />
    </div>
  );
}
