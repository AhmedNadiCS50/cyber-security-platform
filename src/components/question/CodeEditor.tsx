"use client";

import React from "react";
import { Code2 } from "lucide-react";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  disabled?: boolean;
  placeholder?: string;
  minHeight?: number;
}

/** Minimal monospace code editor (a styled textarea). */
export const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "code",
  disabled = false,
  placeholder = "// write your code here…",
  minHeight = 200,
}) => {
  return (
    <div className="w-full border-[3px] border-[#0A0A0A] bg-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 bg-[#171717] border-b-2 border-[#0A0A0A]">
        <div className="flex items-center gap-2 text-[#FACC15]">
          <Code2 className="w-4 h-4" />
          <span className="font-mono text-xs font-bold uppercase">{language}</span>
        </div>
      </div>

      <div className="flex" dir="ltr">
        {/* Line numbers gutter */}
        <div
          aria-hidden
          className="select-none py-3 ps-2 pe-1 text-right font-mono text-[12.5px] leading-relaxed text-gray-600 bg-[#111111]"
        >
          {value.split("\n").map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        <textarea
          dir="ltr"
          value={value}
          disabled={disabled}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ minHeight }}
          className="flex-1 resize-y bg-transparent p-3 font-mono text-[12.5px] leading-relaxed text-[#22C55E] placeholder:text-gray-600 outline-none caret-[#22C55E]"
        />
      </div>
    </div>
  );
};
