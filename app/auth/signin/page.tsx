"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("signIn result:", result);

      if (result?.error) {
        setError(`認証エラー: ${result.error}`);
      } else if (result?.ok) {
        window.location.href = callbackUrl;
      } else {
        setError(`予期しない結果: ${JSON.stringify(result)}`);
      }
    } catch (err) {
      console.error("signIn error:", err);
      setError(`ログインに失敗しました: ${err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-[var(--bg-secondary)] rounded-xl shadow-lg p-8 border border-[var(--border-color)]">
        <h1 className="text-2xl font-bold text-center mb-6">ログイン</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium mb-1 opacity-70"
            >
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1 opacity-70"
            >
              パスワード
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isLoading ? "ログイン中..." : "ログイン"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="opacity-70">アカウントをお持ちでないですか？</span>{" "}
          <Link
            href="/auth/signup"
            className="text-blue-500 hover:text-blue-600 font-medium"
          >
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md">
            <div className="bg-[var(--bg-secondary)] rounded-xl shadow-lg p-8 border border-[var(--border-color)]">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mx-auto" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
                <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        }
      >
        <SignInForm />
      </Suspense>
    </div>
  );
}
