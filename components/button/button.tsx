"use client";

import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const variantStyles = {
  before: "bg-[repeating-linear-gradient(0deg,#d8b48a_0px,#d8b48a_8px,#b98f62_8px,#b98f62_16px,#e0c49c_16px,#e0c49c_24px)]shadow-[0_0_22px_5px_rgba(111,154,179,0.4),inset_-9px_-9px_15px_rgba(0,0,0,0.28),inset_3px_3px_6px_rgba(255,255,255,0.12)]",
  after: null,
};

export default function Button({
  children,
  onClick,
  disabled = false,
  type = "button",
  className = "",
}: ButtonProps): React.JSX.Element | null {
  const [clicked, setClicked] = useState(false);
  const [visible, setVisible] = useState(true); // 表示状態
  const [isRemoved, setIsRemoved] = useState(false); // 完全に消すかどうか

  const handleClick = () => {
    setClicked(true);
    setVisible(false); // まず透明・縮小アニメーションを開始
    onClick?.();

    // アニメーションの時間(300ms)待ってから実際にDOMから削除する
    setTimeout(() => {
      setIsRemoved(true);
    }, 300);
  };

  if (isRemoved) return null; // アニメーション終了後にDOMから消える

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled}
      className={twMerge(
        "h-12 w-12 rounded-full font-medium transition-all duration-300",
        visible ? "opacity-100" : "opacity-0",
        clicked ? variantStyles.after : variantStyles.before,
        className
      )}
    >
      {children}
    </button>
  );
}