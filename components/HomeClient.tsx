"use client";

import Image from "next/image";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { AppTab, Book, BookRating, NewBookInput, ReadingLog } from "@/types/book";
import type { ChatSession, ChatMessage, Recommendation } from "@/types/ai";
import { addBook, finishBook, updateBookStatus } from "@/lib/action/book";
import { saveChatSession, saveWishlistItem } from "@/lib/action/ai";
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
  initialChatSessions: ChatSession[];
  initialWishlist: Recommendation[];
}

const agentExpressions = [
  "/tundog/dog_normal.svg",
  "/tundog/dog_thinking.svg",
  "/tundog/dog_worried.svg",
  "/tundog/dog_smile.svg",
  "/tundog/dog_sleepy.svg",
  "/tundog/dog_surprised.svg",
];

const pickExpression = () => agentExpressions[Math.floor(Math.random() * agentExpressions.length)];

export default function HomeClient({ initialBooks, initialLogs, initialChatSessions, initialWishlist }: HomeClientProps) {
  const defaultChatId = initialChatSessions[0]?.id ?? "local-new";
  // 1. 本のデータ一覧を state で管理
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [logs] = useState<ReadingLog[]>(initialLogs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [finishingBook, setFinishingBook] = useState<Book | null>(null);
  const [towerFilter, setTowerFilter] = useState<"all" | "unread" | "reading">("all");
  const [selectedShelfBook, setSelectedShelfBook] = useState<Book | null>(null);
  const [startedBook, setStartedBook] = useState<Book | null>(null);
  const [recommendedBook, setRecommendedBook] = useState<Book | null>(null);
  const [wishlist, setWishlist] = useState<Recommendation[]>(initialWishlist);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(initialChatSessions.length > 0 ? initialChatSessions : [{
    id: defaultChatId,
    title: "新しい読書相談",
    messages: [{ id: `welcome-${defaultChatId}`, role: "assistant", text: "こんにちは。今日はどんな本を探していますか？気分や読書に使える時間を教えてください。" }],
    recommendation: null,
  }]);
  const [activeChatId, setActiveChatId] = useState(defaultChatId);
  const [chatInput, setChatInput] = useState("");
  const [isChatting, setIsChatting] = useState(false);
  const [agentExpression, setAgentExpression] = useState(agentExpressions[0]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  const [selectedStatsMonth, setSelectedStatsMonth] = useState<string | null>(null);

  // 2. 現在選択されているタブ（"tower" | "shelf" | "logs" | "ai"）を state で管理
  const [activeTab, setActiveTab] = useState<AppTab>("tower");
  const activeChat = chatSessions.find((session) => session.id === activeChatId) ?? chatSessions[0];
  const chatMessages = activeChat?.messages ?? [];
  const recommendation = activeChat?.recommendation ?? null;

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

  const handleChatSubmit = async () => {
    const request = chatInput.trim();
    if (!request || isChatting) return;

    const chatId = activeChatId;
    const currentSession = chatSessions.find((session) => session.id === chatId);
    if (!currentSession) return;
    const userMessage: ChatMessage = { id: `${Date.now()}-user`, role: "user", text: request };
    const sessionWithUserMessage: ChatSession = {
      ...currentSession,
      title: currentSession.title === "新しい読書相談" ? request.slice(0, 28) : currentSession.title,
      recommendation: null,
      messages: [...currentSession.messages, userMessage],
    };
    setChatInput("");
    setChatError(null);
    setIsChatting(true);
    setAgentExpression("/tundog/dog_thinking.svg");
    setChatSessions((sessions) => sessions.map((session) => session.id === chatId
      ? sessionWithUserMessage
      : session));

    try {
      await saveChatSession(sessionWithUserMessage);
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: request }),
      });
      const result: { reply?: string; error?: string; recommendation?: Recommendation | null } = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "AI選書の処理に失敗しました。");
      }

      if (!result.reply?.trim()) {
        throw new Error("AIから有効な返答を受け取れませんでした。");
      }

      const completedSession: ChatSession = {
        ...sessionWithUserMessage,
        recommendation: result.recommendation ?? null,
        messages: [...sessionWithUserMessage.messages, {
            id: `${Date.now()}-assistant`,
            role: "assistant",
            text: result.reply as string,
          }],
      };
      await saveChatSession(completedSession);
      setChatSessions((sessions) => sessions.map((session) => session.id === chatId ? completedSession : session));
      setAgentExpression(pickExpression());
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI選書の処理に失敗しました。";
      setChatError(message);
      setAgentExpression("/tundog/dog_worried.svg");
    } finally {
      setIsChatting(false);
    }
  };

  const addRecommendationToTower = async () => {
    if (!recommendation) return;
    try {
      await addBook({
        title: recommendation.title,
        author: recommendation.author,
        categories: [recommendation.category],
        moodTags: ["知的好奇心"],
        reason: recommendation.reason,
        status: "unread",
      });
      setBooks((currentBooks) => [
        ...currentBooks,
        {
          id: `recommended-${Date.now()}`,
          title: recommendation.title,
          author: recommendation.author,
          categories: [recommendation.category],
          moodTags: ["知的好奇心"],
          reason: recommendation.reason,
          status: "unread",
          addedAt: new Date().toISOString().slice(0, 10),
        },
      ]);
      const session = chatSessions.find((item) => item.id === activeChatId);
      if (session) {
        const updatedSession: ChatSession = {
          ...session,
          recommendation: null,
          messages: [...session.messages, { id: `${Date.now()}-tower`, role: "assistant", text: "積読タワーに追加しました。読みたくなったときにいつでも会いに来てください。" }],
        };
        await saveChatSession(updatedSession);
        setChatSessions((sessions) => sessions.map((item) => item.id === activeChatId ? updatedSession : item));
      }
      setAgentExpression("/tundog/dog_smile.svg");
    } catch {
      setChatError("積読タワーへの追加に失敗しました。時間をおいて、もう一度お試しください。");
      setAgentExpression("/tundog/dog_worried.svg");
    }
  };

  const addRecommendationToWishlist = async () => {
    if (!recommendation) return;
    try {
      await saveWishlistItem(recommendation);
      setWishlist((items) => items.some((item) => item.title === recommendation.title && item.author === recommendation.author) ? items : [...items, recommendation]);
      const session = chatSessions.find((item) => item.id === activeChatId);
      if (session) {
        const updatedSession: ChatSession = {
          ...session,
          recommendation: null,
          messages: [...session.messages, { id: `${Date.now()}-wishlist`, role: "assistant", text: "気になるリストに追加しました。あとでゆっくり選べます。" }],
        };
        await saveChatSession(updatedSession);
        setChatSessions((sessions) => sessions.map((item) => item.id === activeChatId ? updatedSession : item));
      }
      setAgentExpression("/tundog/dog_smile.svg");
    } catch (error) {
      console.error("気になる本の保存に失敗しました。", error);
      setChatError("気になるリストへの保存に失敗しました。時間をおいて、もう一度お試しください。");
      setAgentExpression("/tundog/dog_worried.svg");
    }
  };

  const startNewChat = async () => {
    const newChatId = `${Date.now()}`;
    const newSession: ChatSession = {
      id: newChatId,
      title: "新しい読書相談",
      messages: [{ id: `${newChatId}-welcome`, role: "assistant", text: "こんにちは。今日はどんな本を探していますか？" }],
      recommendation: null,
    };
    try {
      await saveChatSession(newSession);
      setChatSessions((sessions) => [...sessions, newSession]);
      setActiveChatId(newChatId);
      setChatError(null);
      setAgentExpression(pickExpression());
    } catch (error) {
      console.error("新しい会話の保存に失敗しました。", error);
      setChatError("新しい会話を保存できませんでした。時間をおいて、もう一度お試しください。");
    }
  };

  const selectChat = (session: ChatSession) => {
    setActiveChatId(session.id);
    setChatError(null);
    setAgentExpression(pickExpression());
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
      <main className={`flex-1 w-full mx-auto ${activeTab === "quick" || activeTab === "ai" ? "max-w-none p-0" : "max-w-5xl p-4 sm:p-6 lg:p-8"}`}>
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
                        }[book.spineColor ?? "amber"],
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

                      </button >
                      {/* 本を削除するボタン */}
                      <button 
                      aria-label="本を削除" 
                      className="bg-red-500 text-white rounded-full p-2 hover:bg-red-600 cursor-pointer transition duration-200 ease-in-out">
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

        {activeTab === "wishlist" && (
          <div className="font-serif text-[#3d3024]">
            <div className="mb-6">
              <h2 className="text-3xl font-medium">気になる本</h2>
              <p className="mt-2 text-base text-[#93765c]">AIとの会話から保存した本を、あとで見返せます。</p>
            </div>
            {wishlist.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-300 bg-white/50 p-10 text-center text-sm text-stone-500">気になる本はまだありません。AI相談から本を保存してみましょう。</div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {wishlist.map((book) => (
                  <article key={book.title} className="flex gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                    <Image src={book.imageUrl} alt="" width={80} height={112} className="h-28 w-20 rounded object-cover" />
                    <div><h3 className="font-bold text-stone-900">{book.title}</h3><p className="mt-1 text-sm text-stone-500">{book.author}</p><p className="mt-3 text-xs leading-relaxed text-stone-600">{book.reason}</p></div>
                  </article>
                ))}
              </div>
            )}
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
                books={books.filter((book) => book.status !== "finished")}
                moodTags={["30分でサクッと", "じっくり没頭", "モチベUP", "知的好奇心", "気分転換", "感動・泣ける", "教養・スキルアップ"]}
                onNext={(selectedTags) => {
                  const candidate = books.find((book) => book.status !== "finished" && selectedTags.some((tag) => book.moodTags.includes(tag as never)));
                  if (candidate) setRecommendedBook(candidate);
                }}
                onPickOldest={() => {
                  const oldestBook = books
                    .filter((book) => book.status !== "finished")
                    .sort((a, b) => new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime())[0];
                  if (oldestBook) setRecommendedBook(oldestBook);
                }}
              />
            )}
            {startedBook && <div className="mx-auto mt-5 max-w-[420px] rounded-xl border border-amber-300 bg-amber-50 p-4"><p className="font-bold text-stone-900">「{startedBook.title}」の読書を開始しますか？</p><div className="mt-3 flex gap-2"><button type="button" onClick={async () => { await updateBookStatus(startedBook.id, "reading"); setBooks((currentBooks) => currentBooks.map((book) => book.id === startedBook.id ? { ...book, status: "reading" } : book)); setStartedBook(null); }} className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white">はい</button><button type="button" onClick={() => setStartedBook(null)} className="rounded-lg bg-stone-200 px-4 py-2 text-sm font-semibold text-stone-700">いいえ</button></div></div>}
          </div>
        )}

        {activeTab === "stats" && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-stone-900">読書統計</h2>
              <p className="text-sm text-stone-600">読了ログから見る、最近5ヶ月の読書量</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex h-64 items-end justify-around gap-3 border-b border-stone-200 px-2">
                {Array.from({ length: 5 }, (_, index) => {
                  const date = new Date();
                  date.setMonth(date.getMonth() - (4 - index));
                  const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
                  const monthLogs = logs.filter((log) => {
                    const finished = new Date(log.finishedAt);
                    return finished.getFullYear() === date.getFullYear() && finished.getMonth() === date.getMonth();
                  });
                  const isSelected = selectedStatsMonth === monthKey;

                  return (
                    <button
                      key={monthKey}
                      type="button"
                      aria-label={`${date.getMonth() + 1}月の読了本を表示`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedStatsMonth(monthKey)}
                      className="flex h-full flex-1 flex-col items-center justify-end gap-2 rounded-t-lg px-1 hover:bg-amber-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
                    >
                      <span className="text-sm font-bold text-stone-700">{monthLogs.length}冊</span>
                      <span
                        className={`block w-full max-w-16 rounded-t-lg transition-all ${isSelected ? "bg-amber-700" : "bg-amber-500"}`}
                        style={{ height: `${Math.max(monthLogs.length * 32, 8)}px` }}
                      />
                      <span className="text-xs text-stone-500">{date.getMonth() + 1}月</span>
                    </button>
                  );
                })}
              </div>
              {selectedStatsMonth && (
                <div className="mt-5 border-t border-stone-200 pt-4">
                  <h3 className="mb-3 text-sm font-bold text-stone-700">
                    {Number(selectedStatsMonth.slice(5))}月に読んだ本
                  </h3>
                  <ul className="space-y-2">
                    {logs
                      .filter((log) => log.finishedAt.startsWith(selectedStatsMonth))
                      .map((log) => (
                        <li key={log.id} className="rounded-lg bg-stone-50 px-3 py-2 text-sm text-stone-800">
                          {log.bookTitle}
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

                {activeTab === "ai" && (
          <div className="relative h-[calc(100dvh-5.75rem)] overflow-hidden bg-[#fffaf4] text-[15px] text-[#3d3024]">
            <aside className="absolute inset-y-0 left-0 hidden w-64 flex-col bg-[#f8eee1] p-3 sm:flex">
              <button type="button" onClick={startNewChat} className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[#b67340] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#985a30]">
                <span className="text-lg leading-none">＋</span>
                新しい読書相談
              </button>
              <p className="px-2 text-[11px] font-bold tracking-[0.16em] text-[#93765c]">過去の会話</p>
              <div className="mt-3 flex-1 space-y-1 overflow-y-auto">
                {chatSessions.filter((session) => session.id !== activeChatId).slice().reverse().map((session) => (
                  <button key={session.id} type="button" onClick={() => selectChat(session)} className="w-full rounded-xl px-2.5 py-2.5 text-left text-xs text-[#5e4736] transition-colors hover:bg-[#efdfcb]">
                    <span className="block truncate">{session.title}</span>
                    <span className="mt-1 block text-xs text-[#93765c]">{session.messages.length}件のメッセージ</span>
                  </button>
                ))}
                {chatSessions.length === 1 && <p className="px-2 py-4 text-xs leading-relaxed text-[#93765c]">新しい相談を始めると、ここに会話が保存されます。</p>}
              </div>
              <div className="mt-3 border-t border-[#eadbc8] pt-3 text-[11px] text-[#93765c]">読書履歴をもとに選書します</div>
            </aside>
            <section className="flex h-full flex-col sm:ml-64">
              <header className="border-b border-[#eadbc8] bg-[#fffaf4]/95 px-4 py-3 backdrop-blur sm:px-6">
                <div className="mx-auto flex max-w-3xl items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.2em] text-[#b06a3c]">AI BOOK CONCIERGE</p>
                    <h2 className="mt-1 text-lg font-bold">AI選書コンシェルジュ</h2>
                  </div>
                  <button type="button" onClick={startNewChat} className="rounded-lg px-3 py-2 text-xs font-bold text-[#985a30] hover:bg-[#f4e3d0] sm:hidden">＋ 新しい相談</button>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-5 pb-40 sm:px-6">
                <div className="mx-auto max-w-3xl space-y-6">
                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    {message.role === "assistant" && <Image src={agentExpression} alt="" width={34} height={34} className="mt-1 h-8 w-8 object-contain" />}
                    <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${message.role === "user" ? "bg-[#c97b3d] text-white" : "bg-white text-[#5e4736] shadow-sm"}`}>
                      <p className="mb-1 text-[9px] font-bold opacity-60">{message.role === "user" ? "あなた" : "選書エージェント"}</p>
                      {message.text}
                    </div>
                  </div>
                ))}
                {recommendation && (
                  <div className="ml-11 flex max-w-2xl flex-col gap-3 rounded-2xl border border-[#e4c59f] bg-[#fff8eb] p-3 shadow-sm sm:flex-row">
                    <Image src={recommendation.imageUrl} alt={`${recommendation.title}の書影`} width={144} height={208} className="h-48 w-full rounded-xl object-cover sm:h-52 sm:w-36" />
                    <div className="flex flex-1 flex-col">
                      <p className="text-xs font-bold text-[#b06a3c]">おすすめの一冊</p>
                      <h3 className="mt-1 text-lg font-bold text-[#3d3024]">{recommendation.title}</h3>
                      <p className="mt-1 text-sm text-[#93765c]">{recommendation.author}</p>
                      <p className="mt-3 text-xs leading-relaxed text-[#5e4736]">{recommendation.reason}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button type="button" onClick={addRecommendationToTower} className="rounded-full bg-[#b67340] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#985a30]">積読に追加</button>
                        <button type="button" onClick={addRecommendationToWishlist} className="rounded-full border border-[#b67340] px-3 py-1.5 text-[11px] font-bold text-[#985a30] hover:bg-[#f4e3d0]">気になるリストに追加</button>
                      </div>
                    </div>
                  </div>
                )}
                {chatError && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{chatError}</p>}
                </div>
              </div>
              <div className="absolute inset-x-0 bottom-3 px-4 sm:ml-64 sm:px-6">
                <div className="mx-auto max-w-3xl">
                  <div className="flex gap-2 rounded-2xl border border-[#d7c4aa] bg-white p-1.5 shadow-lg">
                    <textarea value={chatInput} onChange={(event) => setChatInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void handleChatSubmit(); } }} placeholder="例：最近疲れているので、短時間で読める本がほしい" rows={2} className="min-w-0 flex-1 resize-none bg-transparent px-3 py-2 text-sm text-[#3d3024] outline-none placeholder:text-stone-400" disabled={isChatting} />
                    <button type="button" onClick={() => void handleChatSubmit()} disabled={!chatInput.trim() || isChatting} className="self-end rounded-xl bg-[#b67340] px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">{isChatting ? "考え中..." : "送信"}</button>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-stone-400">Enterで送信・Shift+Enterで改行</p>
                </div>
              </div>
            </section>
            <div className="pointer-events-none absolute bottom-20 left-2 hidden max-h-[38vh] flex-col items-start sm:flex">
              <div className="mb-1 ml-2 rounded-2xl rounded-bl-sm bg-white px-2.5 py-1.5 text-[11px] text-[#5e4736] shadow-sm">
                {isChatting ? "あなたに合う本を探しています…" : "お気軽に相談してください"}
              </div>
              <p className="mb-0.5 ml-7 text-xs font-bold tracking-wide text-[#5e4736]">つんドック</p>
              <Image src={agentExpression} alt="選書エージェント つんドック" width={120} height={120} className="h-24 w-24 max-h-[22vh] object-contain object-bottom sm:h-28 sm:w-28" />
            </div>
          </div>
        )}

      </main>
      {isAddModalOpen && <AddBookModal onClose={() => setIsAddModalOpen(false)} onSubmit={handleAddBook} />}
      {finishingBook && <FinishBookModal book={finishingBook} onClose={() => setFinishingBook(null)} onFinish={handleFinishBook} />}
    </div>
  );
}