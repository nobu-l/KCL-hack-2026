// components/BookCard.tsx
"use client";

import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
  ageRatio: number;
  onStatusChange: (status: "unread" | "reading") => void;
  onFinish: () => void;
}

export default function BookCard({ book, ageRatio, onStatusChange, onFinish }: BookCardProps) {
  return (
    <div
      suppressHydrationWarning // ← これを追加
      className="book-stack-row group relative"
      style={{ "--book-age": ageRatio } as React.CSSProperties}
    >
      <button type="button" onClick={onFinish} aria-label={`${book.title}を読了にする`} className="book-stack w-full text-left">
        <span className="book-stack__layer book-stack__layer--back" aria-hidden="true" />
        <span className="book-stack__layer book-stack__layer--middle" aria-hidden="true" />
        <span className={`book-stack__cover book-stack__cover--${book.spineColor ?? "stone"}`}>
          <span className="book-stack__cover-mark" aria-hidden="true" />
          <span className="book-stack__title">{book.title}</span>
          <span className="book-stack__author">{book.author}</span>
          <span className="book-stack__category">{book.categories[0]}</span>
        </span>
      </button>

      <div className="absolute right-8 top-1/2 z-10 -translate-y-1/2 font-sans">
        <button type="button" onClick={() => onStatusChange(book.status === "reading" ? "unread" : "reading")} className={`rounded-full px-3 py-1.5 text-xs font-medium ${book.status === "reading" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
          {book.status === "reading" ? "読書中" : "積読中"}
        </button>
      </div>
    </div>
  );
}