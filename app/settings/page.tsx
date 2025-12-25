"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [name, setName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "更新に失敗しました");
        return;
      }

      await update({ name });
      setMessage("プロフィールを更新しました");
    } catch {
      setError("更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("新しいパスワードが一致しません");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "更新に失敗しました");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setMessage("パスワードを更新しました");
    } catch {
      setError("更新に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">設定</h1>
          <Link
            href="/"
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            ← チャットに戻る
          </Link>
        </div>

        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-500 text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Profile Section */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6 mb-6">
          <h2 className="font-medium mb-4">プロフィール</h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">
                メールアドレス
              </label>
              <input
                type="email"
                value={session?.user?.email || ""}
                disabled
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] opacity-50 cursor-not-allowed"
              />
              <p className="text-xs opacity-50 mt-1">メールアドレスは変更できません</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">
                名前
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="名前を入力"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? "更新中..." : "プロフィールを更新"}
            </button>
          </form>
        </div>

        {/* Password Section */}
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] p-6">
          <h2 className="font-medium mb-4">パスワード変更</h2>
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">
                現在のパスワード
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="現在のパスワード"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">
                新しいパスワード
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="6文字以上"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 opacity-70">
                新しいパスワード（確認）
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="もう一度入力"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !currentPassword || !newPassword}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
            >
              {isLoading ? "更新中..." : "パスワードを変更"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
