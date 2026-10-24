import HomeClient from "@/components/HomeClient";
import { getBooks, getLogs } from "@/lib/data/book";

export default async function HomePage() {
  const [books, logs] = await Promise.all([getBooks(), getLogs()]);

  return <HomeClient initialBooks={books} initialLogs={logs} />;
}
