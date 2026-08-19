// components/BookCard.tsx
"use client";

import { Book } from "@/types/book";

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm border border-stone-200 flex justify-between items-center hover:border-stone-300 transition-all">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
            {book.categories.join(", ")}
          </span>
          {book.status === "reading" && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              読書中
            </span>
          )}
        </div>
        <h3 className="text-base sm:text-lg font-bold text-stone-900">
          {book.title}
        </h3>
        <p className="text-sm text-stone-500">著者: {book.author}</p>
      </div>

      <span
        className={`text-xs px-3 py-1 rounded-full font-medium ${
          book.status === "reading"
            ? "bg-blue-50 text-blue-700 border border-blue-200"
            : "bg-amber-50 text-amber-700 border border-amber-200"
        }`}
      >
        {book.status === "reading" ? "読書中" : "積読中"}
      </span>
    </div>
  );
}