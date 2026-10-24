"use client";

import { useState } from "react";
import { Book, BookRating } from "@/types/book";

interface FinishBookModalProps { book: Book; onClose: () => void; onFinish: (book: Book, rating: BookRating, impressions: string, finishedAt: string) => void; }

export default function FinishBookModal({ book, onClose, onFinish }: FinishBookModalProps) {
  const [rating, setRating] = useState<BookRating>(5);
  const [impressions, setImpressions] = useState("");
  const [finishedAt, setFinishedAt] = useState(new Date().toISOString().slice(0, 10));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4" onMouseDown={onClose}>
      <section className="w-full max-w-lg rounded-2xl bg-stone-50 p-6 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Finish reading</p><h2 className="mt-1 text-2xl font-bold text-stone-950">読了を記録する</h2><p className="mt-2 text-sm text-stone-600">{book.title}</p></div><button type="button" onClick={onClose} aria-label="モーダルを閉じる" className="text-2xl leading-none text-stone-400 hover:text-stone-800">×</button></div><form onSubmit={(event) => { event.preventDefault(); onFinish(book, rating, impressions.trim(), finishedAt); }} className="mt-6 space-y-5"><label className="block text-sm font-semibold text-stone-700">読了日<input required type="date" value={finishedAt} onChange={(event) => setFinishedAt(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /></label><fieldset><legend className="text-sm font-semibold text-stone-700">評価</legend><div className="mt-2 flex gap-1">{([1, 2, 3, 4, 5] as BookRating[]).map((value) => <button type="button" key={value} aria-label={`${value}つ星`} onClick={() => setRating(value)} className={`text-3xl ${value <= rating ? "text-amber-500" : "text-stone-300"}`}>★</button>)}</div></fieldset><label className="block text-sm font-semibold text-stone-700">感想（任意）<textarea value={impressions} onChange={(event) => setImpressions(event.target.value)} rows={5} className="mt-2 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" /></label><div className="flex justify-end gap-2 border-t border-stone-200 pt-5"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-200">キャンセル</button><button type="submit" className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">読了にする</button></div></form></section>
    </div>
  );
}