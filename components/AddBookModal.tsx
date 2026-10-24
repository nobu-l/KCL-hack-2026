"use client";

import { useState } from "react";
import { BookCategory, BookStatus, MoodTag, NewBookInput } from "@/types/book";

interface AddBookModalProps {
  onClose: () => void;
  onSubmit: (book: NewBookInput, status: BookStatus) => void;
}

const categories: BookCategory[] = ["技術・IT", "ビジネス・経済", "小説", "詩", "ミステリー", "SF", "ファンタジー", "ホラー", "恋愛", "文学", "自己啓発", "教養・科学", "デザイン・アート", "その他"];
const moodTags: MoodTag[] = ["30分でサクッと", "じっくり没頭", "モチベUP", "知的好奇心", "気分転換", "感動・泣ける", "教養・スキルアップ"];

export default function AddBookModal({ onClose, onSubmit }: AddBookModalProps) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [reason, setReason] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<BookCategory[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<MoodTag[]>([]);

  const toggle = <T,>(values: T[], value: T, setValues: (next: T[]) => void) => {
    setValues(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  };

  const submit = (status: BookStatus) => {
    if (!title.trim() || !author.trim() || selectedCategories.length === 0 || selectedMoods.length === 0) return;
    onSubmit({ title: title.trim(), author: author.trim(), categories: selectedCategories, moodTags: selectedMoods, reason: reason.trim() || undefined }, status);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/55 p-4" onMouseDown={onClose}>
      <section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-stone-50 p-5 shadow-2xl sm:p-7" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Library entry</p><h2 className="mt-1 text-2xl font-bold text-stone-950">本を追加する</h2></div><button type="button" onClick={onClose} aria-label="モーダルを閉じる" className="text-2xl leading-none text-stone-400 hover:text-stone-800">×</button></div>
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold text-stone-700">題名<input required value={title} onChange={(event) => setTitle(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" /></label><label className="text-sm font-semibold text-stone-700">著者名<input required value={author} onChange={(event) => setAuthor(event.target.value)} className="mt-2 w-full rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" /></label></div>
          <fieldset><legend className="text-sm font-semibold text-stone-700">ジャンル（複数選択）</legend><div className="mt-2 flex flex-wrap gap-2">{categories.map((category) => <button type="button" key={category} onClick={() => toggle(selectedCategories, category, setSelectedCategories)} className={`rounded-full border px-3 py-1.5 text-xs ${selectedCategories.includes(category) ? "border-amber-600 bg-amber-600 text-white" : "border-stone-300 bg-white text-stone-600 hover:border-amber-400"}`}>{category}</button>)}</div></fieldset>
          <fieldset><legend className="text-sm font-semibold text-stone-700">ムードタグ（複数選択）</legend><div className="mt-2 flex flex-wrap gap-2">{moodTags.map((mood) => <button type="button" key={mood} onClick={() => toggle(selectedMoods, mood, setSelectedMoods)} className={`rounded-full border px-3 py-1.5 text-xs ${selectedMoods.includes(mood) ? "border-blue-600 bg-blue-600 text-white" : "border-stone-300 bg-white text-stone-600 hover:border-blue-400"}`}>{mood}</button>)}</div></fieldset>
          <label className="block text-sm font-semibold text-stone-700">購入した理由（任意）<textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} className="mt-2 w-full resize-y rounded-lg border border-stone-300 bg-white px-3 py-2.5 font-normal outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200" /></label>
          <div className="flex flex-col-reverse gap-2 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2.5 text-sm font-semibold text-stone-600 hover:bg-stone-200">キャンセル</button><button type="button" onClick={() => submit("unread")} className="rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-700">積読に追加</button><button type="button" onClick={() => submit("finished")} className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">読了に追加</button></div>
        </div>
      </section>
    </div>
  );
}