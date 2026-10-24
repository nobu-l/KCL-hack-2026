"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type GiftBook = {
  title: string;
  author: string;
  message: string;
};

type GiftBookRevealProps = {
  book: GiftBook;
  onNext: () => void;
};

export function GiftBookReveal({ book, onNext }: GiftBookRevealProps) {
  const [opened, setOpened] = useState(false);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(ellipse_at_50%_20%,#fbe4c8,#fdf1e2)] px-6 py-6 font-serif text-[#3d3024]">
      <div className="relative w-full max-w-sm rounded-2xl border border-[#3d3024]/10 bg-[#fdf1e2] p-10 text-center shadow-[0_2px_20px_rgba(61,48,36,0.08)]">
        {!opened && <p className="mb-8 font-sans text-[13px] text-[#93765c]">あなたに贈る、今日の一冊</p>}

        <AnimatePresence>
          {!opened && (
            <motion.button
              type="button"
              onClick={() => setOpened(true)}
              aria-label="封蝋をはがして開封する"
              className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#c97b3d] shadow-[0_2px_10px_rgba(181,101,29,0.35)]"
              initial={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.5, rotate: 25, x: 40, y: -40 }}
              transition={{ duration: 0.5, ease: "easeIn" }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
                <path d="M14 4 L16.5 11.5 L24 14 L16.5 16.5 L14 24 L11.5 16.5 L4 14 L11.5 11.5 Z" fill="#fdf1e2" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {!opened && <p className="mt-4 font-sans text-xs text-[#93765c]/70">タップして開封する</p>}

        {opened && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}>
            <p className="mb-6 font-sans text-[13px] text-[#93765c]">あなたに贈る、今日の一冊</p>
            <h1 className="mb-1 text-2xl font-medium">{book.title}</h1>
            <p className="mb-6 font-sans text-sm text-[#93765c]">{book.author}</p>
            <p className="mb-10 whitespace-pre-line text-[15px] leading-relaxed text-[#3d3024]/80">{book.message}</p>
            <button type="button" onClick={onNext} className="rounded-full bg-[#c97b3d] px-8 py-[11px] font-sans text-sm text-[#fdf1e2] transition-transform hover:-translate-y-0.5">
              次へ進む
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}