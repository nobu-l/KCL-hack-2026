"use client";

import { AppTab } from "@/types/book";

/**
 * Navbar コンポーネントの Props（親から受け取るデータや関数）の型定義
 */
interface NavbarProps {
  activeTab: AppTab;                   // 現在選択されているタブ（"tower" | "shelf" | "logs" | "ai"）
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
  // タブの定義一覧
  const tabs: { id: AppTab; label: string; icon: string; badge?: number }[] = [
    {
      id: "tower",
      label: "積読タワー",
      icon: "📖",
      badge: unreadCount,
    },
    {
      id: "shelf",
      label: "本棚",
      icon: "🪵",
      badge: finishedCount,
    },
    {
      id: "logs",
      label: "読書ログ",
      icon: "📝",
    },
    {
      id: "ai",
      label: "AI相談",
      icon: "✨",
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[rgb(108,53,36)] backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 左側: アプリロゴ & タイトル */}
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-100 flex items-center gap-2">
              積読コンシェルジュ
            </h1>
            <p className="text-xs text-stone-400 hidden sm:block">
              積読を楽しみ、読書の達成感を味わう
            </p>
          </div>
        </div>

        {/* 中央: タブナビゲーション（フラット・下線デザインに変更） */}
        <nav className="flex items-stretch h-16 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 sm:px-4 h-full text-sm transition-colors whitespace-nowrap border-b-2 ${
                  isActive
                    ? "border-amber-500 text-amber-400 font-bold"
                    : "border-transparent text-stone-400 font-medium hover:text-stone-200 hover:border-stone-600"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>

                {/* 冊数バッジ */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.5 rounded-full font-bold leading-tight ${
                      isActive
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 右側: 本を追加ボタン */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-3.5 py-2 rounded-xl text-sm transition-all transform active:scale-95 shadow-md shadow-amber-500/10 cursor-pointer"
          >
            <span className="text-base leading-none">＋</span>
            <span className="hidden sm:inline">本を追加</span>
          </button>
        </div>
      </div>
    </header>
  );
}