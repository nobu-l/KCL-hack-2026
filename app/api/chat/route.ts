import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";
import { getBooks, getLogs } from "@/lib/data/book";

const model = "gemini-3.8-flash";
const maxGeminiRetries = 2;
const bookCategories = ["技術・IT", "ビジネス・経済", "小説", "詩", "ミステリー", "SF", "ファンタジー", "ホラー", "恋愛", "文学", "自己啓発", "教養・科学", "デザイン・アート", "その他"] as const;

type GeminiReply = {
  reply: string;
  recommendation: {
    title: string;
    author: string;
    reason: string;
    category: (typeof bookCategories)[number];
  } | null;
};

const parseGeminiReply = (text: string): GeminiReply => {
  try {
    const parsed: unknown = JSON.parse(text.replace(/^```json\s*/, "").replace(/\s*```$/, "").trim());
    if (typeof parsed !== "object" || parsed === null || !("reply" in parsed) || typeof parsed.reply !== "string") {
      throw new Error("Geminiの返答形式が不正です。");
    }

    let recommendation: GeminiReply["recommendation"] = null;
    if ("recommendation" in parsed && parsed.recommendation && typeof parsed.recommendation === "object") {
      const candidate = parsed.recommendation;
      if (
        "title" in candidate && typeof candidate.title === "string" &&
        "author" in candidate && typeof candidate.author === "string" &&
        "reason" in candidate && typeof candidate.reason === "string"
      ) {
        const category = "category" in candidate && typeof candidate.category === "string" && bookCategories.includes(candidate.category as (typeof bookCategories)[number])
          ? candidate.category as (typeof bookCategories)[number]
          : "その他";
        recommendation = { title: candidate.title, author: candidate.author, reason: candidate.reason, category };
      }
    }

    return { reply: parsed.reply, recommendation };
  } catch {
    return { reply: text, recommendation: null };
  }
};

const isRetryableGeminiError = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('"code":503') ||
    message.includes('"status":"UNAVAILABLE"') ||
    message.includes('"code":429') ||
    message.includes('"status":"RESOURCE_EXHAUSTED"');
};

const getGeminiErrorStatus = (error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('"code":503') || message.includes('"status":"UNAVAILABLE"')) return 503;
  if (message.includes('"code":429') || message.includes('"status":"RESOURCE_EXHAUSTED"')) return 429;
  return 500;
};

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "リクエストのJSONを読み取れませんでした。" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("message" in body) ||
    typeof body.message !== "string" ||
    body.message.trim().length === 0
  ) {
    return NextResponse.json({ error: "messageは必須です。" }, { status: 400 });
  }

  const message = body.message.trim();
  if (message.length > 2000) {
    return NextResponse.json({ error: "messageは2000文字以内で入力してください。" }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Gemini APIキーが設定されていません。" }, { status: 500 });
  }

  try {
    const [books, logs] = await Promise.all([getBooks(), getLogs()]);
    const recentLogs = logs.slice(0, 50);
    const readingHistory = [
      "## 登録されている本",
      ...(books.length > 0
        ? books.map(
            (book) =>
              `- ${book.title} / ${book.author} / 状態: ${book.status} / ジャンル: ${book.categories.join("、")}`,
          )
        : ["- 登録されている本はありません。"]),
      "",
      "## 読了履歴",
      ...(recentLogs.length > 0
        ? recentLogs.map(
            (log) =>
              `- ${log.bookTitle} / ${log.bookAuthor} / 読了日: ${log.finishedAt} / 評価: ${log.rating}/5 / 感想: ${log.impressions || "なし"}`,
          )
        : ["- 読了履歴はありません。"]),
    ].join("\n");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const contents = `# ユーザーの読書履歴
${readingHistory}

# ユーザーの相談
${message}

# 返答形式
JSONのみを返してください。次の形式を必ず守ってください。
{
  "reply": "ユーザーへの会話文。推薦する場合は短い推薦案内を含める。",
  "recommendation": {
    "title": "本のタイトル",
    "author": "著者名",
    "reason": "推薦理由を一言",
    "category": "ジャンル"
  }
}
推薦できる本が見つからない場合は、recommendationをnullにしてください。`;
    let response;
    for (let attempt = 0; attempt <= maxGeminiRetries; attempt += 1) {
      try {
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            responseMimeType: "application/json",
            systemInstruction:
              "あなたは落ち着いた雰囲気の読書相談役です。口調は敬語にしてください。ユーザーの読書履歴を参考に、本を押し付けずに会話形式で提案してください。推薦理由は短く一言で説明してください。条件に合う本を見つけられない場合は、別の条件を聞き返してください。既に登録済みの本は推薦しないでください。存在するか自信のない本は推薦しないでください。ユーザーのリクエストには必ず従ってください。これまでに読んだことのないジャンルを選んでほしいという要望には読書履歴に基づいて対応してください。ユーザーが名前を尋ねたら「私の名前はつんドックです。あなたの読書履歴から適切な選書をするよう心がけるので、いつでも気軽に相談してくださいね。」と返してください。返答は必ず指定されたJSON形式にしてください。",
          },
        });
        break;
      } catch (error) {
        if (!isRetryableGeminiError(error) || attempt === maxGeminiRetries) throw error;
        await new Promise((resolve) => setTimeout(resolve, 800 * 2 ** attempt));
      }
    }

    const reply = parseGeminiReply(response?.text ?? "");
    return NextResponse.json({
      reply: reply.reply,
      recommendation: reply.recommendation
        ? { ...reply.recommendation, imageUrl: "/book-cover-placeholder.svg" }
        : null,
    });
  } catch (error) {
    console.error("AI選書リクエストに失敗しました。", error);
    const status = getGeminiErrorStatus(error);
    const errorMessage = status === 503
      ? "Geminiが混み合っています。少し時間をおいて、もう一度お試しください。"
      : status === 429
        ? "Gemini APIの利用上限に達しました。少し時間をおいて、もう一度お試しください。"
        : "AI選書の処理に失敗しました。";
    return NextResponse.json({ error: errorMessage }, { status });
  }
}
