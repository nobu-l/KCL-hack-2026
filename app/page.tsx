"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AppTab, Book } from "@/types/book";
import { INITIAL_BOOKS } from "@/lib/mockData";
import BookCard from "@/components/book_card";

export default function Home() {
  // 1. 本のデータ一覧を state で管理
  const [books, setBooks] = useState<Book[]>(INITIAL_BOOKS);

  // 2. 現在選択されているタブ（"tower" | "shelf" | "logs" | "ai"）を state で管理
  const [activeTab, setActiveTab] = useState<AppTab>("tower");

  // 3. Navbar のバッジ用に「積読中の冊数」と「読了冊数」を計算
  const unreadCount = books.filter(
    (b) => b.status === "unread" || b.status === "reading"
  ).length;
  const finishedCount = books.filter((b) => b.status === "finished").length;

  // 4. 「+ 本を登録」ボタンが押された時の処理（仮ハンドラ）
  const handleOpenAddModal = () => {
    alert("本を追加するモーダルは次のステップで実装します！");
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col">
      {/* ナビゲーションバーの表示 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={handleOpenAddModal}
        unreadCount={unreadCount}
        finishedCount={finishedCount}
      />

      {/* メインコンテンツエリア */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* タブに応じた画面表示の切り替え */}
        {activeTab === "tower" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-stone-900">積読タワー</h2>
                <p className="text-sm text-stone-600">
                  現在読んでいる本や、これから読みたい本のリストです
                </p>
              </div>
              <span className="text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                積読中: {unreadCount} 冊
              </span>
            </div>

            {/* 本の一覧カード表示 */}
            <div className="space-y-3">
              {books
                .filter((b) => b.status !== "finished")
                .map((book) => (
                  <BookCard key={book.id} book={book}/>
                  ))}
            </div>
          </div>
        )}

        {activeTab === "shelf" && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-600">
            <h2 className="text-xl font-bold text-stone-900 mb-2">🪵 本棚画面</h2>
            <p className="text-sm">読了した本（{finishedCount}冊）が並ぶバーチャル本棚をここに作成します。</p>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-600">
            <h2 className="text-xl font-bold text-stone-900 mb-2">📝 読書ログ</h2>
            <p className="text-sm">読了後の感想や星評価の記録タイムラインをここに作成します。</p>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-600">
            <h2 className="text-xl font-bold text-stone-900 mb-2">✨ AI選書相談</h2>
            <p className="text-sm">次に読む本のアドバイスをくれるAIコンシェルジュをここに作成します。</p>
          </div>
        )}
      </main>
    </div>
  );
}