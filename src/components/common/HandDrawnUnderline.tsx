"use client";

import React from "react";

interface HandDrawnUnderlineProps {
  children?: React.ReactNode;
  color?: string;
  className?: string;
}

export const HandDrawnUnderline: React.FC<HandDrawnUnderlineProps> = ({
  children,
  color = "#FACC15",
  className = "",
}) => {
  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute left-0 -bottom-2 sm:-bottom-3 w-full h-3 sm:h-4 overflow-visible pointer-events-none z-0"
        viewBox="0 0 250 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <path
          d="M 3 12 C 45 4, 110 3, 175 7 C 205 9, 235 15, 247 13"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 12 15 C 65 9, 140 10, 230 11"
          stroke="#0A0A0A"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="4 4"
        />
      </svg>
    </span>
  );
};

export const HandDrawnCircle: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "#FACC15",
}) => {
  return (
    <span className="relative inline-block p-1">
      <span className="relative z-10">{children}</span>
      <svg
        className="absolute inset-0 w-full h-full -top-1 -left-1 pointer-events-none z-0"
        viewBox="0 0 100 100"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M10 50 C10 20, 25 10, 50 10 C80 10, 95 25, 95 50 C95 80, 75 95, 50 95 C20 95, 8 75, 12 45"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
};
