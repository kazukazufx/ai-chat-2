"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string;
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
                  className="p-4 flex items-center justify-between hover:bg-[var(--sidebar-hover)] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {user.name || "名前未設定"}
                      </p>
                    </div>
                    <p className="text-sm opacity-70 truncate">{user.email}</p>
                    <p className="text-xs opacity-50 mt-1">
                      登録: {formatDate(user.createdAt)} ・ 会話数:{" "}
                      {user._count.conversations}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(user)}
                    disabled={deletingId === user.id}
                    className="ml-4 px-3 py-1.5 text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 disabled:opacity-50 rounded-lg transition-colors"
                  >
                    {deletingId === user.id ? "削除中..." : "削除"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
