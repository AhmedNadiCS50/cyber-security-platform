"use client";

import React from "react";
import { Card } from "@/components/common/Card";
import { X } from "lucide-react";

// ─── Shared field styles (kept in one place so every editor matches) ──────────

export const inputClass =
  "w-full p-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm text-[#0A0A0A] focus:outline-none focus:border-[#3346F0]";

export const textareaClass = `${inputClass} leading-relaxed resize-y`;

export const selectClass = `${inputClass} cursor-pointer`;

export const labelClass = "block text-xs font-black text-[#0A0A0A] mb-1";

export const helpClass = "text-[11px] font-bold text-gray-500 mt-1";

interface FieldProps {
  label: string;
  help?: string;
  children: React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({ label, help, children }) => (
  <div>
    <label className={labelClass}>{label}</label>
    {children}
    {help && <p className={helpClass}>{help}</p>}
  </div>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────

interface AdminModalProps {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  /** Tailwind max-width class. */
  maxWidth?: string;
  footer?: React.ReactNode;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  title,
  subtitle,
  onClose,
  children,
  maxWidth = "max-w-2xl",
  footer,
}) => (
  <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start sm:items-center justify-center p-3 sm:p-4 overflow-y-auto">
    <Card
      variant="white"
      hoverEffect={false}
      className={`${maxWidth} w-full p-5 sm:p-7 shadow-[10px_10px_0px_#0A0A0A] my-6`}
    >
      <div className="flex items-start justify-between gap-4 mb-5 pb-3 border-b-2 border-[#0A0A0A]">
        <div>
          <h3 className="font-black text-xl sm:text-2xl text-[#0A0A0A]">{title}</h3>
          {subtitle && (
            <p className="text-xs font-bold text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="close"
          className="p-1.5 bg-[#FAF6EC] border-2 border-[#0A0A0A] hover:bg-red-100 cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {children}
      {footer && (
        <div className="mt-6 pt-4 border-t-2 border-gray-200">{footer}</div>
      )}
    </Card>
  </div>
);
