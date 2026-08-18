"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AppTab, Book } from "@/types/book";
import { INITIAL_BOOKS } from "@/lib/mockData";

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
                  <div
                    key={book.id}
                    className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-stone-200 flex justify-between items-center hover:border-stone-300 transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {book.categories.join(", ")}
                        </span>
                        {book.status === "reading" && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            読書中
                          </span>
                        )}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900">
                        {book.title}
                      </h3>
                      <p className="text-sm text-stone-500">著者: {book.author}</p>
                    </div>

                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        book.status === "reading"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {book.status === "reading" ? "読書中" : "積読中"}
                    </span>
                  </div>
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