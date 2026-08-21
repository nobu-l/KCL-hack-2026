"use client";

/**
 * SearchBar コンポーネントの Props（親から受け取るデータや関数）の型定義
 */
interface SearchBarProps {
  value: string;                      // 現在の検索文字列（親が state で管理）
  onChange: (value: string) => void;  // 入力が変わるたびに親に伝える関数
  placeholder?: string;               // プレースホルダー文言（任意）
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "題名・著者名で検索",
}: SearchBarProps) {
  return (
    <div className="relative w-full">
      {/* 検索アイコン（装飾） */}
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm pointer-events-none">
        🔍
      </span>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-stone-200 bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
      />

      {/* 入力がある時だけ「クリアボタン」を表示 */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="検索をクリア"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-sm"
        >
          ✕
        </button>
      )}
    </div>
  );
}