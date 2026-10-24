"use client";

import { BookStatus } from "@/types/book";

/**
 * StatusSwitch コンポーネントの Props（親から受け取るデータや関数）の型定義
 */
interface StatusSwitchProps {
  status: BookStatus;                      // 今のステータス("unread" | "reading" のどちらかを想定)
  onToggle: (nextStatus: BookStatus) => void; // 切り替えられた時に、次のステータスを親に伝える関数
}

export default function StatusSwitch({ status, onToggle }: StatusSwitchProps) {
  const isReading = status === "reading";

  const handleClick = () => {
    // 今 reading なら unread に、unread なら reading に切り替える
    const nextStatus: BookStatus = isReading ? "unread" : "reading";
    onToggle(nextStatus);
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`text-xs font-medium transition-colors ${
          !isReading ? "text-amber-700" : "text-stone-400"
        }`}
      >
        積読中
      </span>

      {/* スイッチ本体（トグルボタン） */}
      <button
        type="button"
        role="switch"
        aria-checked={isReading}
        onClick={handleClick}
        className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 cursor-pointer ${
          isReading ? "bg-blue-500" : "bg-stone-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            isReading ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </button>

      <span
        className={`text-xs font-medium transition-colors ${
          isReading ? "text-blue-700" : "text-stone-400"
        }`}
      >
        読書中
      </span>
    </div>
  );
}