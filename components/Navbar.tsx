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
  // タブの定義一覧（配列にして map で回すことでコードをスッキリ保ちます）
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
    <header className="sticky top-0 z-30 bg-stone-900/95 backdrop-blur-md border-b border-stone-800 text-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* 左側: アプリロゴ & タイトル */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
            📚
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-stone-100 flex items-center gap-2">
              積読コンシェルジュ
            </h1>
            <p className="text-xs text-stone-400 hidden sm:block">
              積読を楽しみ、読書の達成感を味わう
            </p>
          </div>
        </div>

        {/* 中央: タブナビゲーション */}
        <nav className="flex items-center gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/60 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-amber-600 text-white shadow-sm font-semibold"
                    : "text-stone-300 hover:text-stone-100 hover:bg-stone-700/50"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>

                {/* 冊数バッジ（積読数・本棚数がある場合） */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`ml-1 text-[11px] px-1.5 py-0.2 rounded-full font-bold leading-tight ${
                      isActive
                        ? "bg-stone-900/70 text-amber-200"
                        : "bg-stone-700 text-stone-300"
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
            <span className="hidden sm:inline">本を登録</span>
          </button>
        </div>
      </div>
    </header>
  );
}
