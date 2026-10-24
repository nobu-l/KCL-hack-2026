"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AppTab, Book, BookRating, NewBookInput, ReadingLog } from "@/types/book";
import { addBook, finishBook, updateBookStatus } from "@/lib/action/book";
import BookCard from "@/components/book_card";
import SearchBar from "@/components/SearchBar";
import StatusSwitch from "@/components/StatusSwitch";
import AddBookModal from "@/components/AddBookModal";
import FinishBookModal from "@/components/FinishBookModal";
import { MoodPicker } from "@/components/MoodPicker";
import { GiftBookReveal } from "@/components/GiftBookReveal";

interface HomeClientProps {
  initialBooks: Book[];
  initialLogs: ReadingLog[];
}

export default function HomeClient({ initialBooks, initialLogs }: HomeClientProps) {
  // 1. 本のデータ一覧を state で管理
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [logs] = useState<ReadingLog[]>(initialLogs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [finishingBook, setFinishingBook] = useState<Book | null>(null);
  const [towerFilter, setTowerFilter] = useState<"all" | "unread" | "reading">("all");
  const [selectedShelfBook, setSelectedShelfBook] = useState<Book | null>(null);
  const [startedBook, setStartedBook] = useState<Book | null>(null);
  const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
  const [now] = useState(() => Date.now());

  // 2. 現在選択されているタブ（"tower" | "shelf" | "logs" | "ai"）を state で管理
  const [activeTab, setActiveTab] = useState<AppTab>("tower");

  // 3. Navbar のバッジ用に「積読中の冊数」と「読了冊数」を計算
  const unreadCount = books.filter(
    (b) => b.status === "unread" || b.status === "reading"
  ).length;
  const finishedCount = books.filter((b) => b.status === "finished").length;

  // 4. 「+ 本を登録」ボタンが押された時の処理（仮ハンドラ）
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  const handleAddBook = async (input: NewBookInput, status: Book["status"]) => {
    await addBook({ ...input, status });
    setIsAddModalOpen(false);
    window.location.reload();
  };

  const handleFinishBook = async (book: Book, rating: BookRating, impressions: string, finishedAt: string) => {
    await finishBook({ bookId: book.id, rating, impressions, finishedAt });
    setFinishingBook(null);
    window.location.reload();
  };

  // ５　検索バーの入力値を state で管理
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen flex flex-col bg-[#efe3d3]">
      {/* ナビゲーションバーの表示 */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenAddModal={handleOpenAddModal}
        unreadCount={unreadCount}
        finishedCount={finishedCount}
      />

      {/* メインコンテンツエリア */}
      <main className={`flex-1 w-full mx-auto ${activeTab === "quick" ? "max-w-none p-0" : "max-w-5xl p-4 sm:p-6 lg:p-8"}`}>
        {/* タブに応じた画面表示の切り替え */}
        {activeTab === "tower" && (
          <div className="font-serif text-[#3d3024]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-medium text-[#3d3024]">積読タワー</h2>
                <p className="mt-2 text-base text-[#93765c]">
                  現在読んでいる本や、これから読みたい本のリストです
                </p>
              </div>
              <span className="font-sans text-sm font-semibold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                積読中: {unreadCount} 冊
              </span>
            </div>
            {/* 検索バー */}
            <div className="mb-4 font-sans">
              <SearchBar value={searchQuery} onChange={setSearchQuery} />
            </div>
            <div className="mb-5 flex flex-col gap-3 border-b border-stone-200 pb-4 font-sans sm:flex-row sm:items-center sm:justify-between"><StatusSwitch status={towerFilter === "reading" ? "reading" : "unread"} onToggle={(nextStatus) => setTowerFilter(nextStatus === "reading" ? "reading" : "unread")} /><button type="button" onClick={() => setTowerFilter("all")} className={`text-xs font-semibold ${towerFilter === "all" ? "text-stone-900" : "text-stone-500 hover:text-stone-800"}`}>すべて表示</button></div>
            {/* 本の一覧カード表示 */}
            <div className="space-y-0">
              {books
                .filter((b) => b.status !== "finished")
                .filter((b) => towerFilter === "all" || b.status === towerFilter)
                .filter((b) =>b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||b.author.toLowerCase().includes(searchQuery.toLowerCase()))
                .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
                .map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    ageRatio={Math.min(Math.max((now - new Date(book.addedAt).getTime()) / (1000 * 60 * 60 * 24 * 120), 0), 1)}
                    onStatusChange={async (status) => {
                      await updateBookStatus(book.id, status);
                      setBooks((currentBooks) => currentBooks.map((currentBook) => currentBook.id === book.id ? { ...currentBook, status } : currentBook));
                    }}
                    onFinish={() => setFinishingBook(book)}
                  />
                  ))}
            </div>
           
          </div>
        )}

        {activeTab === "shelf" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-stone-900">読了本棚</h2>
              <p className="text-sm text-stone-600">読了した本を作者名順に並べています</p>
            </div>
            <div className="overflow-x-auto rounded-2xl bg-[#7a4a2e] p-5 shadow-inner">
              <div className="flex min-h-72 min-w-max items-end gap-3 border-b-8 border-[#4b2b1b] px-4 pb-3">
                {books
                  .filter((book) => book.status === "finished")
                  .sort((a, b) => a.author.localeCompare(b.author, "ja"))
                  .map((book) => (
                    <button
                      key={book.id}
                      type="button"
                      onClick={() => setSelectedShelfBook(book)}
                      className="flex h-52 w-16 items-end justify-center rounded-t-md border-x-2 border-white/10 px-2 pb-4 text-left text-xs font-bold text-white shadow-lg transition-transform hover:-translate-y-2"
                      style={{
                        backgroundColor: {
                          amber: "#b7791f",
                          emerald: "#276749",
                          sky: "#2b6cb0",
                          rose: "#9b2c2c",
                          indigo: "#44337a",
                          stone: "#57534e",
                          teal: "#2c7a7b",
                        }[book.spineColor ?? "stone"],
                      }}
                    >
                      <span className="[writing-mode:vertical-rl]">{book.title}</span>
                    </button>
                  ))}
              </div>
            </div>
            {selectedShelfBook && (() => {
              const selectedLog = logs.find((log) => log.bookId === selectedShelfBook.id);

              return (
                <div
                  className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/50 p-4"
                  onClick={() => setSelectedShelfBook(null)}
                >
                  <div
                    className="w-full max-w-md rounded-2xl bg-stone-50 p-6"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-xs font-bold text-emerald-700">READING LOG</p>
                        <h3 className="mt-1 text-xl font-bold text-stone-900">
                          {selectedShelfBook.title}
                        </h3>
                        <p className="text-sm text-stone-500">{selectedShelfBook.author}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedShelfBook(null)}
                        aria-label="詳細を閉じる"
                        className="text-2xl text-stone-400"
                      >
                        ×
                      </button>
                    </div>

                    {selectedLog ? (
                      <div className="mt-5 space-y-5 text-sm text-stone-700">
                        <div>
                          <p className="font-semibold text-stone-500">読了日</p>
                          <p className="mt-1">{selectedLog.finishedAt}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-500">評価</p>
                          <div
                            className="mt-1 text-2xl tracking-wide"
                            aria-label={`${selectedLog.rating}つ星`}
                          >
                            {[1, 2, 3, 4, 5].map((value) => (
                              <span
                                key={value}
                                className={value <= selectedLog.rating ? "text-amber-500" : "text-stone-300"}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-stone-500">感想</p>
                          <p className="mt-1 whitespace-pre-wrap rounded-lg bg-white p-3">
                            {selectedLog.impressions || "感想は記録されていません。"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-5">
                        <p className="text-sm text-stone-600">この本の読了ログはまだありません。</p>
                        <button
                          type="button"
                          onClick={() => setFinishingBook(selectedShelfBook)}
                          className="mt-4 w-full rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800"
                        >
                          読了ログを追加
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === "quick" && (
          <div>
            {recommendedBook ? (
              <GiftBookReveal
                book={{
                  title: recommendedBook.title,
                  author: recommendedBook.author,
                  message: recommendedBook.reason ?? "今の気分に寄り添う一冊を選びました。",
                }}
                onNext={() => {
                  setStartedBook(recommendedBook);
                  setRecommendedBook(null);
                }}
              />
            ) : (
              <MoodPicker
                books={books.filter((book) => book.status !== "finished").map(({ title, author }) => ({ title, author }))}
                moodTags={["30分でサクッと", "じっくり没頭", "モチベUP", "知的好奇心", "気分転換", "感動・泣ける", "教養・スキルアップ"]}
                onNext={(selectedTags) => {
                  const candidate = books.find((book) => book.status !== "finished" && selectedTags.some((tag) => book.moodTags.includes(tag as never)));
                  if (candidate) setRecommendedBook(candidate);
                }}
              />
            )}
            {startedBook && <div className="mx-auto mt-5 max-w-[420px] rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-bold text-stone-900">「{startedBook.title}」の読書を開始しますか？</p><div className="mt-3 flex gap-2"><button type="button" onClick={async () => { await updateBookStatus(startedBook.id, "reading"); setBooks((currentBooks) => currentBooks.map((book) => book.id === startedBook.id ? { ...book, status: "reading" } : book)); setStartedBook(null); }} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">はい</button><button type="button" onClick={() => setStartedBook(null)} className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-700">いいえ</button></div></div>}
          </div>
        )}

        {activeTab === "stats" && (
          <div><div className="mb-6"><h2 className="text-xl font-bold text-stone-900">読書統計</h2><p className="text-sm text-stone-600">読了ログから見る、最近5ヶ月の読書量</p></div><div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"><div className="flex h-64 items-end justify-around gap-3 border-b border-stone-200 px-2">{Array.from({ length: 5 }, (_, index) => { const date = new Date(); date.setMonth(date.getMonth() - (4 - index)); const count = logs.filter((log) => { const finished = new Date(log.finishedAt); return finished.getFullYear() === date.getFullYear() && finished.getMonth() === date.getMonth(); }).length; return <div key={date.toISOString()} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-sm font-bold text-stone-700">{count}冊</span><div className="w-full max-w-16 rounded-t-lg bg-amber-500 transition-all" style={{ height: `${Math.max(count * 32, 8)}px` }} /><span className="text-xs text-stone-500">{date.getMonth() + 1}月</span></div>; })}</div></div>
          </div>
        )}

        {activeTab === "ai" && (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-600"><h2 className="text-xl font-bold text-stone-900">AI選書コンシェルジュ</h2><p className="mt-2 text-sm">登録外の本も相談できるチャットをここに接続します。</p>
          </div>
        )}

      </main>
      {isAddModalOpen && <AddBookModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddBook} />}
      {finishingBook && <FinishBookModal book={finishingBook} onClose={() => setFinishingBook(null)} onFinish={handleFinishBook} />}
    </div>
  );
}