"use server";

import { createClient } from "@/lib/supabase/server";
import type { ChatSession, Recommendation } from "@/types/ai";

export async function saveChatSession(session: ChatSession) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_chat_sessions").upsert({
    id: session.id,
    title: session.title,
    messages: session.messages,
    recommendation: session.recommendation,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}

export async function saveWishlistItem(recommendation: Recommendation) {
  const supabase = await createClient();
  const { error } = await supabase.from("ai_wishlist").upsert(
    {
      title: recommendation.title,
      author: recommendation.author,
      reason: recommendation.reason,
      image_url: recommendation.imageUrl,
      category: recommendation.category,
    },
    { onConflict: "user_id,title,author" },
  );
  if (error) throw error;
}
