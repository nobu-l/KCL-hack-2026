"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthState = {
  error?: string;
  message?: string;
};

const getCredentials = (formData: FormData) => {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  if (password.length < 6) {
    return { error: "パスワードは6文字以上で入力してください。" };
  }

  return { email, password };
};

export async function signIn(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = getCredentials(formData);
  if ("error" in credentials) return credentials;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(credentials);

  if (error) return { error: "ログインできませんでした。入力内容を確認してください。" };

  redirect("/");
}

export async function signUp(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const credentials = getCredentials(formData);
  if ("error" in credentials) return credentials;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp(credentials);

  if (error) return { error: "アカウントを作成できませんでした。入力内容を確認してください。" };

  if (!data.session) {
    return { message: "確認メールを送信しました。メール内のリンクから登録を完了してください。" };
  }

  redirect("/");
}
