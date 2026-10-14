"use client";

import React from "react";
import Link from "next/link";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "dark" | "outline" | "orange";
  size?: "sm" | "md" | "lg";
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "start" | "end";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "start",
  children,
  className = "",
  disabled,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-bold border-[2.5px] border-[#0A0A0A] transition-all duration-150 select-none cursor-pointer text-center";

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs sm:text-sm gap-1.5 shadow-[2px_2px_0px_#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_#0A0A0A]",
    md: "px-5 py-2.5 text-sm sm:text-base gap-2 shadow-[4px_4px_0px_#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_#0A0A0A] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0px_#0A0A0A]",
    lg: "px-7 py-3.5 text-base sm:text-lg gap-3 shadow-[5px_5px_0px_#0A0A0A] hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[7px_7px_0px_#0A0A0A] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0px_#0A0A0A]",
  }[size];

  const variantClasses = {
    primary: "bg-[#FACC15] text-[#0A0A0A] hover:bg-[#FDE047]",
    secondary: "bg-[#3346F0] text-white hover:bg-[#2535C5]",
    dark: "bg-[#0A0A0A] text-white hover:bg-[#262626] shadow-[4px_4px_0px_#FACC15]",
    outline: "bg-[#FFFFFF] text-[#0A0A0A] hover:bg-[#FAF6EC]",
    orange: "bg-[#FF6B00] text-white hover:bg-[#E05E00]",
  }[variant];

  const disabledClasses = disabled
    ? "opacity-50 pointer-events-none cursor-not-allowed shadow-[2px_2px_0px_#0A0A0A] translate-x-0 translate-y-0"
    : "";

  const combinedClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${className}`;

  const content = (
    <>
      {icon && iconPosition === "start" && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
      {icon && iconPosition === "end" && <span className="inline-flex shrink-0">{icon}</span>}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled} className={combinedClasses} {...props}>
      {content}
    </button>
  );
};
