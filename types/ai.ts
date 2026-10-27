import type { Book } from "@/types/book";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type Recommendation = {
  title: string;
  author: string;
  reason: string;
  imageUrl: string;
  category: Book["categories"][number];
};

export type ChatSession = {
  id: string;
  title: string;
  messages: ChatMessage[];
  recommendation: Recommendation | null;
};
