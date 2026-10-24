"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AppTab } from "@/types/book";
import { createClient } from "@/lib/supabase/client";

/**
 * Navbar コンポーネントの Props（親から受け取るデータや関数）の型定義
 */
interface NavbarProps {
  activeTab: AppTab;                   // 現在選択されているタブ
  onTabChange: (tab: AppTab) => void;  // タブがクリックされたときに親に通知する関数
  onOpenAddModal: () => void;          // 「+ 本を追加」ボタンが押されたときの関数
  unreadCount: number;                 // 積読中の冊数（バッジ表示用）
  finishedCount: number;               // 読了・本棚の冊数（バッジ表示用）
}

export default function Navbar({
  activeTab,
  onTabChange,
  onOpenAddModal,
  unreadCount,
  finishedCount,
}: NavbarProps) {
  const [email, setEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError(null);
    const { error } = await createClient().auth.signOut();
    if (error) {
      setIsSigningOut(false);
      setSignOutError("ログアウトできませんでした。もう一度お試しください。");
      return;
    }
    window.location.href = "/login";
  };

  // タブの定義一覧
  const tabs: { id: AppTab; label: string; badge?: number }[] = [
    {
      id: "tower",
      label: "積読タワー",
      badge: unreadCount,
    },
    {
      id: "shelf",
      label: "本棚",
      badge: finishedCount,
    },
    {
      id: "wishlist",
      label: "気になる本",
    },
    {
      id: "quick",
      label: "クイック診断",
    },
    {
      id: "ai",
      label: "AI相談",
    },
    {
      id: "stats",
      label: "読書統計",
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#d7c4aa] bg-[#f3eadb]/90 backdrop-blur-sm shadow-[0_1px_0_rgba(96,71,49,0.08)]">
      <div className="mx-auto flex h-[92px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-[210px] items-center justify-start">
          <Image
            src="/logo.svg"
            alt="積読コンシェルジュ"
            width={240}
            height={48}
            className="h-[48px] w-auto object-contain"
            priority
          />
        </div>

        <nav className="flex flex-1 items-center justify-center gap-1 overflow-x-auto md:gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex h-full items-center gap-2 border-b-2 px-3 py-2 text-[15px] whitespace-nowrap transition-colors sm:px-4 ${
                  isActive
                    ? "border-[#b06a3c] font-bold text-[#3a2d24]"
                    : "border-transparent font-medium text-[#5a4538] hover:text-[#2f261f]"
                }`}
              >
                <span>{tab.label}</span>

                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`inline-flex min-w-[21px] items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold leading-none ${
                      isActive
                        ? "bg-[#e7d3b5] text-[#7a4f30]"
                        : "bg-[#d8c7b1] text-[#5a4538]"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center justify-end gap-3">
          {email && (
            <div className="hidden text-right sm:block">
              <p className="max-w-[180px] truncate text-xs text-[#806653]">{email}</p>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-xs font-bold text-[#8b5634] hover:underline disabled:opacity-60"
              >
                {isSigningOut ? "ログアウト中..." : "ログアウト"}
              </button>
              {signOutError && <p className="text-xs text-red-700">{signOutError}</p>}
            </div>
          )}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 rounded-[18px] bg-[#b67340] px-5 py-3 text-base font-bold text-[#fffaf4] shadow-[0_4px_0_rgba(121,80,47,0.25)] transition-transform active:scale-[0.98]"
          >
            <span className="text-lg leading-none">＋</span>
            <span>本を追加</span>
          </button>
        </div>
      </div>
    </header>
  );
}