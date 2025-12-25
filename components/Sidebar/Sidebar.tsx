"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Conversation } from "@/types";
import { ConversationList } from "./ConversationList";
import { ThemeToggle } from "../UI/ThemeToggle";
import { PlusIcon } from "../UI/Icons";

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  isOpen,
  onClose,
}: SidebarProps) {
  const { data: session } = useSession();

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/auth/signin" });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 h-screen bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
          ${!isOpen ? "md:hidden" : ""}
        `}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={handleNewChat}
            className="flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--sidebar-hover)] transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="text-sm">新しいチャット</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          <ConversationList
            conversations={conversations}
            activeId={activeId}
            onSelect={handleSelect}
            onDelete={onDelete}
          />
        </div>

        <div className="p-3 border-t border-[var(--border-color)] space-y-3">
          {session?.user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                  {session.user.name?.charAt(0).toUpperCase() ||
                    session.user.email?.charAt(0).toUpperCase() ||
                    "U"}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {session.user.name || "ユーザー"}
                  </p>
                  <p className="text-xs opacity-50 truncate">
                    {session.user.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  href="/settings"
                  className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors"
                  title="設定"
                >
                  <svg
                    className="w-4 h-4 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-[var(--sidebar-hover)] transition-colors"
                  title="ログアウト"
                >
                  <svg
                    className="w-4 h-4 opacity-70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-70">AI Chat</span>
            <ThemeToggle />
          </div>
        </div>
      </aside>
    </>
  );
}
