"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type UserStatus = "PENDING" | "APPROVED" | "REJECTED";

interface User {
  id: string;
  name: string | null;
  email: string;
  status: UserStatus;
  createdAt: string;
  _count: {
    conversations: number;
  };
}

export function AdminPanel() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUsers(data);
    } catch {
      setError("ユーザー一覧の取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (user: User) => {
    if (!confirm(`${user.email} を削除しますか？\n会話データも全て削除されます。`)) {
      return;
    }

    setDeletingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "削除に失敗しました");
        return;
      }

      setUsers(users.filter((u) => u.id !== user.id));
    } catch {
      alert("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  };

  const handleStatusChange = async (user: User, newStatus: UserStatus) => {
    if (newStatus === "REJECTED") {
      if (!confirm(`${user.email} の登録を拒否しますか？`)) {
        return;
      }
    }

    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "更新に失敗しました");
        return;
      }

      setUsers(users.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u)));
    } catch {
      alert("更新に失敗しました");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case "PENDING":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
            承認待ち
          </span>
        );
      case "APPROVED":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/10 text-green-500 border border-green-500/20">
            承認済み
          </span>
        );
      case "REJECTED":
        return (
          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
            拒否
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">管理者画面</h1>
          <Link
            href="/"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            ← チャットに戻る
          </Link>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] overflow-hidden">
          <div className="p-4 border-b border-[var(--border-color)]">
            <h2 className="font-medium">ユーザー一覧</h2>
            <p className="text-sm opacity-70 mt-1">
              {users.length} 人のユーザー
            </p>
          </div>

          {isLoading ? (
            <div className="p-8 text-center opacity-70">読み込み中...</div>
          ) : users.length === 0 ? (
            <div className="p-8 text-center opacity-70">
              ユーザーがいません
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-color)]">
              {users.map((user) => (
                <div
                  key={user.id}
                  className={`p-4 flex items-center justify-between hover:bg-[var(--sidebar-hover)] transition-colors ${
                    user.status === "PENDING" ? "bg-yellow-500/5" : ""
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {user.name || "名前未設定"}
                      </p>
                      {getStatusBadge(user.status)}
                    </div>
                    <p className="text-sm opacity-70 truncate">{user.email}</p>
                    <p className="text-xs opacity-50 mt-1">
                      登録: {formatDate(user.createdAt)} ・ 会話数:{" "}
                      {user._count.conversations}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {user.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => handleStatusChange(user, "APPROVED")}
                          disabled={updatingId === user.id}
                          className="px-3 py-1.5 text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          {updatingId === user.id ? "..." : "承認"}
                        </button>
                        <button
                          onClick={() => handleStatusChange(user, "REJECTED")}
                          disabled={updatingId === user.id}
                          className="px-3 py-1.5 text-sm bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 disabled:opacity-50 rounded-lg transition-colors"
                        >
                          拒否
                        </button>
                      </>
                    )}
                    {user.status === "REJECTED" && (
                      <button
                        onClick={() => handleStatusChange(user, "APPROVED")}
                        disabled={updatingId === user.id}
                        className="px-3 py-1.5 text-sm bg-green-500/10 text-green-500 hover:bg-green-500/20 disabled:opacity-50 rounded-lg transition-colors"
                      >
                        {updatingId === user.id ? "..." : "承認"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(user)}
                      disabled={deletingId === user.id}
                      className="px-3 py-1.5 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 rounded-lg transition-colors"
                    >
                      {deletingId === user.id ? "削除中..." : "削除"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
