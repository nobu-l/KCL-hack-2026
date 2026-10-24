// lib/data/books.ts
import { createClient } from "@/lib/supabase/server";
import type { Book, BookRating, ReadingLog, SpineColor } from "@/types/book";

type BookRow = {
  id: string;
  title: string;
  author: string;
  categories: Book["categories"];
  status: Book["status"];
  mood_tags: Book["moodTags"];
  pages: number | null;
  reason: string | null;
  spine_color: SpineColor;
  added_at: string;
};

type ReadingLogRow = {
  id: string;
  book_id: string;
  finished_at: string;
  rating: BookRating;
  impressions: string;
  books: {
    title: string;
    author: string;
    categories: Book["categories"];
    mood_tags: Book["moodTags"];
  };
};

const toBook = (r: BookRow): Book => ({
  id: r.id,
  title: r.title,
  author: r.author,
  categories: r.categories,
  status: r.status,
  moodTags: r.mood_tags,
  pages: r.pages ?? 0,
  reason: r.reason ?? "",
  spineColor: r.spine_color,
  addedAt: r.added_at,
});

export async function getBooks(): Promise<Book[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .order("added_at", { ascending: false });
  if (error) throw error;
  return (data as BookRow[]).map(toBook);
}

export async function getLogs(): Promise<ReadingLog[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reading_logs")
    .select("*, books(title, author, categories, mood_tags)")
    .order("finished_at", { ascending: false });
  if (error) throw error;

  return (data as ReadingLogRow[]).map((r) => ({
    id: r.id,
    bookId: r.book_id,
    bookTitle: r.books.title,
    bookAuthor: r.books.author,
    categories: r.books.categories,
    moodTags: r.books.mood_tags,
    finishedAt: r.finished_at,
    rating: r.rating,
    impressions: r.impressions,
  }));
}