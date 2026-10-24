"use client";

import { useEffect, useRef, useState } from "react";

type Book = { title: string; author: string };

type FloatingItem = {
  id: number;
  title: string;
  author: string;
  top: number;
  left: number;
  duration: number;
};

type MoodPickerProps = {
  books: Book[];
  moodTags: string[];
  onNext: (selectedTags: string[]) => void;
};

export function MoodPicker({ books, moodTags, onNext }: MoodPickerProps) {
  const [floaters, setFloaters] = useState<FloatingItem[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    if (books.length === 0) return;

    const spawn = () => {
      const book = books[Math.floor(Math.random() * books.length)];
      const top = Math.random() * 86 + 4;
      const left = Math.random() * 90 + 3;
      const duration = 7 + Math.random() * 4;
      const id = nextId.current++;

      setFloaters((prev) => [...prev, { id, title: book.title, author: book.author, top, left, duration }]);

      window.setTimeout(() => {
        setFloaters((prev) => prev.filter((floater) => floater.id !== id));
      }, duration * 1000);
    };

    const interval = window.setInterval(spawn, 2200);
    const initialTimers = [0, 1].map((index) => window.setTimeout(spawn, index * 600));

    return () => {
      window.clearInterval(interval);
      initialTimers.forEach(window.clearTimeout);
    };
  }, [books]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]);
  };

  return (
    <div className="relative left-1/2 flex min-h-[calc(100vh-4rem)] w-screen -translate-x-1/2 items-center justify-center overflow-hidden px-6 py-6 font-serif text-[#3d3024] bg-[radial-gradient(ellipse_at_50%_20%,#fbe4c8,#fdf1e2)]">
      <style>{`
        @keyframes mood-float {
          0% { opacity: 0; transform: translateY(14px) scale(0.94); filter: blur(1px); }
          15% { opacity: 0.85; transform: translateY(0) scale(1); filter: blur(0); }
          75% { opacity: 0.85; }
          100% { opacity: 0; transform: translateY(-14px) scale(0.96); filter: blur(1px); }
        }
      `}</style>

      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {floaters.map((floater) => (
          <div
            key={floater.id}
            className="absolute flex flex-col items-start whitespace-nowrap"
            style={{
              top: `${floater.top}%`,
              left: `${floater.left}%`,
              animation: `mood-float linear forwards ${floater.duration}s`,
            }}
          >
            <span className="text-[15px] tracking-wide text-[#b5651d] [text-shadow:0_0_10px_rgba(181,101,29,0.18)]">{floater.title}</span>
            <span className="mt-[3px] text-xs text-[#93765c]">{floater.author}</span>
          </div>
        ))}
      </div>

      <div className="relative z-10 max-w-[420px] text-center">
        <h2 className="mb-1.5 text-xl font-medium">今の気分に合う一冊を</h2>
        <p className="mb-7 font-sans text-[13px] text-[#93765c]">気分に近いタグを選んでください</p>

        {books.length === 0 ? (
          <p className="font-sans text-sm text-[#93765c]">診断できる積読本がありません。</p>
        ) : (
          <>
            <div className="mb-8 flex flex-wrap justify-center gap-2.5 font-sans">
              {moodTags.map((tag) => {
                const selected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-[18px] py-[9px] text-[13px] transition-colors ${selected ? "border-[#c97b3d] bg-[#c97b3d]/[0.18]" : "border-[#3d3024]/20 bg-[#3d3024]/[0.03] hover:border-[#c97b3d]"}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={selectedTags.length === 0}
              onClick={() => onNext(selectedTags)}
              className="rounded-full bg-[#c97b3d] px-8 py-[11px] font-sans text-sm text-[#fdf1e2] transition-transform disabled:cursor-not-allowed disabled:opacity-35 [&:not(:disabled)]:hover:-translate-y-0.5"
            >
              次へ進む
            </button>
          </>
        )}
      </div>
    </div>
  );
}