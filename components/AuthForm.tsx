"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "@/lib/action/auth";

const initialState: AuthState = {};

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [state, formAction, isPending] = useActionState(
    isSignUp ? signUp : signIn,
    initialState,
  );

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label htmlFor="email" className="mb-2 block text-sm font-bold text-[#4f3a2b]">
          メールアドレス
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-[#d7c4aa] bg-[#fffaf4] px-4 py-3 text-[#3a2d24] outline-none transition focus:border-[#b67340] focus:ring-2 focus:ring-[#b67340]/20"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-bold text-[#4f3a2b]">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          minLength={6}
          required
          className="w-full rounded-xl border border-[#d7c4aa] bg-[#fffaf4] px-4 py-3 text-[#3a2d24] outline-none transition focus:border-[#b67340] focus:ring-2 focus:ring-[#b67340]/20"
        />
      </div>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.message && (
        <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-xl bg-[#b67340] px-4 py-3 font-bold text-[#fffaf4] transition hover:bg-[#9f6135] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "処理中..." : isSignUp ? "アカウントを作成" : "ログイン"}
      </button>

      <button
        type="button"
        onClick={() => setIsSignUp((current) => !current)}
        className="w-full text-sm font-semibold text-[#8b5634] hover:underline"
      >
        {isSignUp ? "すでにアカウントをお持ちの方はこちら" : "新規アカウントを作成する"}
      </button>
    </form>
  );
}
