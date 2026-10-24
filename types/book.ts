/**
 * 型定義
 * 
 * TypeScriptの型（Type）を定義することで、データの構造（どんなキーや型を持つか）を明確にし、
 * タイポや予期せぬバグを防ぎます。
 */

// 本の読書ステータス（未読・読書中・読了）
export type BookStatus = "unread" | "reading" | "finished";

// 気分・目的タグ（今夜読む1冊の診断や絞り込みで使用）
export type MoodTag =
  | "30分でサクッと"
  | "じっくり没頭"
  | "モチベUP"
  | "知的好奇心"
  | "気分転換"
  | "感動・泣ける"
  | "教養・スキルアップ";

// 本のジャンル・カテゴリ
export type BookCategory =
  | "技術・IT"
  | "ビジネス・経済"
  | "小説"
  | "詩"
  | "ミステリー"
  | "SF"
  | "ファンタジー"
  | "ホラー"
  | "恋愛"
  | "文学"
  | "自己啓発"
  | "教養・科学"
  | "デザイン・アート"
  | "その他";

  export type bookstatus =
  | "latest"
  | "new"

// 本の背表紙カラー（バーチャル本棚で並べる際の色）
export type SpineColor =
  | "amber"
  | "emerald"
  | "sky"
  | "rose"
  | "indigo"
  | "stone"
  | "teal";

// 本の評価（１～５）
export type BookRating = 1 | 2 | 3 | 4 | 5;

// ユーザーがフォームで入力する本の情報（登録時に使用する型）
// id, status, addedAt はアプリ側が自動で決めるので、フォームでは扱わない
export type NewBookInput = Omit<Book, "id" | "status" | "addedAt" | "spineColor">;

/**
 * 本のデータモデル
 */
export interface Book {
  id: string;                  // 一意のID（例: "1", "book-1723800000"）
  title: string;               // 本のタイトル
  author: string;              // 著者名
  categories: BookCategory[];  // カテゴリ（複数選択）
  status: BookStatus;          // 読書ステータス
  moodTags: MoodTag[];         // 気分・シーンタグの配列
  pages?: number;              // ページ数（任意）
  reason?: string;             // なぜ買ったか・読みたい理由（任意）
  spineColor?: SpineColor;     // 本棚での背表紙カラー（任意）
  addedAt: string;             // 登録日（例: "2026-08-16"）
}

/**
 * 読了ログ（感想・評価・読了日の記録）
 */
export interface ReadingLog {
  id: string;                  // ログID
  bookId: string;              // 読んだ本のID
  bookTitle: string;           // 本のタイトル
  bookAuthor: string;          // 著者名
  categories: BookCategory[];  // カテゴリ（複数選択）
  moodTags: MoodTag[];         // 気分タグ(複数選択)
  finishedAt: string;          // 読了日（例: "2026-08-16"）
  rating: BookRating;          // 星評価（1〜5）
  impressions: string;         // 一言感想・学んだこと
}

/**
 * 本棚で本をタップして「開いた」ときに表示する詳細データの型
 * 本の基本情報と、記録された読了感想ログをセットで保持します。
 */
export interface OpenedBookDetail {
  book: Book;                  // 開いた本の基本情報
  log?: ReadingLog;            // その本に紐づく読了ログ（読了日・星評価・感想）
}

/**
 * AI選書コンシェルジュの推薦結果の型
 */
export interface AiRecommendation {
  title: string;               // おすすめ本のタイトル
  author: string;              // 著者名
  reason: string;              // 推薦理由（なぜこの本がおすすめか）
  suggestedMood?: string;      // おすすめの読書シーン
  category?: BookCategory;     // カテゴリ（任意）
  spineColor?: SpineColor;     // 背表紙カラー（任意）
}

/**
 * アプリのメイン画面タブ切り替え型
 */
export type AppTab = "tower" | "shelf" | "quick" | "ai" | "stats";
