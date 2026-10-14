"use client";

import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "white" | "cream" | "dark" | "yellow" | "blue";
  hoverEffect?: boolean;
  borderWidth?: "2px" | "3px";
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "white",
  hoverEffect = true,
  borderWidth = "3px",
  children,
  className = "",
  ...props
}) => {
  const bgClasses = {
    white: "bg-white text-[#0A0A0A]",
    cream: "bg-[#FAF6EC] text-[#0A0A0A]",
    dark: "bg-[#0A0A0A] text-white",
    yellow: "bg-[#FACC15] text-[#0A0A0A]",
    blue: "bg-[#3346F0] text-white",
  }[variant];

  const borderClass = borderWidth === "3px" ? "border-[3px] border-[#0A0A0A]" : "border-2 border-[#0A0A0A]";
  
  const shadowClass = variant === "dark" 
    ? "shadow-[5px_5px_0px_#FACC15]" 
    : "shadow-[5px_5px_0px_#0A0A0A]";

  const hoverClass = hoverEffect
    ? "transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[8px_8px_0px_#0A0A0A]"
    : "";

  return (
    <div
      className={`relative ${borderClass} ${bgClasses} ${shadowClass} ${hoverClass} p-5 sm:p-6 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
