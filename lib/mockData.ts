import { Book, ReadingLog, SpineColor } from "@/types/book";

// 背表紙カラーの選択肢（本棚に並べる際の色）
export const SPINE_COLORS: SpineColor[] = [
  "amber",
  "emerald",
  "sky",
  "rose",
  "indigo",
  "stone",
  "teal",
];

/**
 * 開発・確認用の初期デモ本データ（純粋な配列）
 * 積読中、読書中、そして本棚に並ぶ読了本を用意しています。
 */
export const INITIAL_BOOKS: Book[] = [
  {
    id: "book-1",
    title: "世界一流エンジニアの思考法",
    author: "牛尾 剛",
    categories: ["技術・IT", "自己啓発"],
    status: "reading",
    moodTags: ["モチベUP", "教養・スキルアップ"],
    pages: 288,
    reason: "仕事の進め方や思考の整理法を身につけたいから",
    spineColor: "indigo",
    addedAt: "2026-08-10",
  },
  {
    id: "book-2",
    title: "プロジェクト・ヘイル・メアリー",
    author: "アンディ・ウィアー",
    categories: ["SF", "小説"],
    status: "unread",
    moodTags: ["じっくり没頭", "気分転換"],
    pages: 450,
    reason: "SF好きの友達に大絶賛されたので週末に一気読みしたい",
    spineColor: "sky",
    addedAt: "2026-08-12",
  },
  {
    id: "book-3",
    title: "ゼロ・トゥ・ワン 君はゼロから何を生み出せるか",
    author: "ピーター・ティール",
    categories: ["ビジネス・経済"],
    status: "unread",
    moodTags: ["モチベUP", "知的好奇心"],
    pages: 260,
    reason: "新しいプロダクト作りの発想法を学びたい",
    spineColor: "amber",
    addedAt: "2026-08-14",
  },
  {
    id: "book-4",
    title: "夜と霧",
    author: "ヴィクトール・E・フランクル",
    categories: ["文学", "教養・科学"],
    status: "finished",
    moodTags: ["じっくり没頭", "教養・スキルアップ"],
    pages: 200,
    reason: "人生観を深める名著としてずっと気になっていた",
    spineColor: "stone",
    addedAt: "2026-08-01",
  },
  {
    id: "book-5",
    title: "リーダブルコード",
    author: "Dustin Boswell",
    categories: ["技術・IT"],
    status: "finished",
    moodTags: ["30分でサクッと", "教養・スキルアップ"],
    pages: 260,
    reason: "チーム開発で読みやすいコードを書けるようになりたかった",
    spineColor: "emerald",
    addedAt: "2026-08-05",
  },
  {
    id: "book-6",
    title: "FACTFULNESS",
    author: "ハンス・ロスリング",
    categories: ["教養・科学", "ビジネス・経済"],
    status: "finished",
    moodTags: ["知的好奇心", "教養・スキルアップ"],
    pages: 350,
    reason: "データに基づいた世界の見方を学びたかった",
    spineColor: "teal",
    addedAt: "2026-08-08",
  },
];

/**
 * 読了本の感想ログ初期データ（バーチャル本棚で開いたときに表示されます）
 */
export const INITIAL_LOGS: ReadingLog[] = [
  {
    id: "log-1",
    bookId: "book-4",
    bookTitle: "夜と霧",
    bookAuthor: "ヴィクトール・E・フランクル",
    categories: ["文学", "教養・科学"],
    moodTags: ["じっくり没頭", "教養・スキルアップ"],
    finishedAt: "2026-08-06",
    rating: 5,
    impressions: "どんな過酷な状況でも『希望や生きる意味を見出す意志』を持つことの尊さを学んだ。心が洗われる名著。",
  },
  {
    id: "log-2",
    bookId: "book-5",
    bookTitle: "リーダブルコード",
    bookAuthor: "Dustin Boswell",
    categories: ["技術・IT"],
    moodTags: ["30分でサクッと", "教養・スキルアップ"],
    finishedAt: "2026-08-09",
    rating: 5,
    impressions: "変数名や関数の分割など、明日からのコードがすぐに劇的に綺麗になる実践的な知恵が詰まっていた！",
  },
  {
    id: "log-3",
    bookId: "book-6",
    bookTitle: "FACTFULNESS",
    bookAuthor: "ハンス・ロスリング",
    categories: ["教養・科学", "ビジネス・経済"],
    moodTags: ["知的好奇心", "教養・スキルアップ"],
    finishedAt: "2026-08-15",
    rating: 4,
    impressions: "直感や思い込みではなく、正しいデータで世界を見る重要性を痛感した。グラフの見せ方も面白かった。",
  },
];
