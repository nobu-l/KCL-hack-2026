import HomeClient from "@/components/HomeClient";
import { getBooks, getLogs } from "@/lib/data/book";
import { getChatSessions, getWishlist } from "@/lib/data/ai";

export default async function HomePage() {
  const [books, logs, chatSessions, wishlist] = await Promise.all([
    getBooks(),
    getLogs(),
    getChatSessions(),
    getWishlist(),
  ]);

  return <HomeClient initialBooks={books} initialLogs={logs} initialChatSessions={chatSessions} initialWishlist={wishlist} />;
}
