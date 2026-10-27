import { createClient } from "@/lib/supabase/server";
import type { ChatSession, Recommendation } from "@/types/ai";

type ChatSessionRow = {
  id: string;
  title: string;
  messages: ChatSession["messages"];
  recommendation: Recommendation | null;
};

type WishlistRow = {
  title: string;
  author: string;
  reason: string;
  image_url: string;
  category: Recommendation["category"];
};

export async function getChatSessions(): Promise<ChatSession[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_chat_sessions")
    .select("id, title, messages, recommendation")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data as ChatSessionRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    messages: row.messages,
    recommendation: row.recommendation,
  }));
}

export async function getWishlist(): Promise<Recommendation[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("ai_wishlist")
    .select("title, author, reason, image_url, category")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as WishlistRow[]).map((row) => ({
    title: row.title,
    author: row.author,
    reason: row.reason,
    imageUrl: row.image_url,
    category: row.category,
  }));
}
