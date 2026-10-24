"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { SPINE_COLORS, type BookRating, type BookStatus, type SpineColor } from "@/types/book";

const randomSpineColor = (): SpineColor => SPINE_COLORS[Math.floor(Math.random() * SPINE_COLORS.length)];

export async function addBook(input: {
  title: string;
  author: string;
  categories: string[];
  moodTags: string[];
  pages?: number;
  reason?: string;
  spineColor?: SpineColor;
  status: BookStatus;
}) {
  const supabase = await createClient();
  const { error } = await supabase.from("books").insert({
    title: input.title,
    author: input.author,
    categories: input.categories,
    mood_tags: input.moodTags,
    pages: input.pages,
    reason: input.reason,
    spine_color: input.spineColor ?? randomSpineColor(),
    status: input.status,
  });
  if (error) throw error;
  revalidatePath("/");
}

export async function updateBookStatus(bookId: string, status: BookStatus) {
  const supabase = await createClient();
  const { error } = await supabase.from("books").update({ status }).eq("id", bookId);
  if (error) throw error;
  revalidatePath("/");
}

export async function finishBook(input: {
  bookId: string;
  finishedAt: string;
  rating: BookRating;
  impressions: string;
}) {
  const supabase = await createClient();
  const { error: bookError } = await supabase
    .from("books")
    .update({ status: "finished" })
    .eq("id", input.bookId);
  if (bookError) throw bookError;

  const { error: logError } = await supabase.from("reading_logs").insert({
    book_id: input.bookId,
    finished_at: input.finishedAt,
    rating: input.rating,
    impressions: input.impressions,
  });
  if (logError) throw logError;
  revalidatePath("/");
}