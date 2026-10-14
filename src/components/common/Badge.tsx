"use client";

import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "yellow" | "blue" | "dark" | "orange" | "cream" | "green";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = "yellow",
  size = "md",
  children,
  className = "",
  ...props
}) => {
  const bgClasses = {
    yellow: "bg-[#FACC15] text-[#0A0A0A]",
    blue: "bg-[#3346F0] text-white",
    dark: "bg-[#0A0A0A] text-white",
    orange: "bg-[#FF6B00] text-white",
    cream: "bg-[#FAF6EC] text-[#0A0A0A]",
    green: "bg-[#22C55E] text-[#0A0A0A]",
  }[variant];

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs font-bold border-[1.5px] border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]",
    md: "px-3 py-1 text-xs sm:text-sm font-extrabold border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]",
    lg: "px-4 py-1.5 text-sm sm:text-base font-black border-[2.5px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]",
  }[size];

  return (
    <span
      className={`inline-flex items-center justify-center gap-1.5 uppercase tracking-wide select-none ${bgClasses} ${sizeClasses} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const SectionNumberBadge: React.FC<{ num: string | number; className?: string }> = ({
  num,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 bg-[#FACC15] text-[#0A0A0A] font-black text-sm sm:text-base border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] select-none ${className}`}
    >
      {num}
    </div>
  );
};
