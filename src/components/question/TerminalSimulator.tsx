"use client";

import React, { useEffect, useRef, useState } from "react";
import { CornerDownLeft, Terminal as TerminalIcon } from "lucide-react";

export type TerminalLineKind = "input" | "output" | "error" | "system";

export interface TerminalLine {
  kind: TerminalLineKind;
  text: string;
}

interface TerminalSimulatorProps {
  /** Current input value (controlled). */
  value: string;
  onChange: (value: string) => void;
  /** Called when the learner presses Enter / hits Run. */
  onSubmit?: (command: string) => void;
  /** Optional command handler. When provided, its output is printed. */
  onCommand?: (command: string) => string[] | Promise<string[]>;
  /** Shell prompt shown before the input, e.g. `student@lab:~$`. */
  prompt?: string;
  placeholder?: string;
  disabled?: boolean;
  initialLines?: TerminalLine[];
  minHeight?: number;
  /** Label of the run button shown on small screens. */
  runLabel?: string;
}

const BUILTIN_HELP = [
  "This is a simulated terminal — no real commands are executed.",
  "Type your answer and press Enter, then submit the quiz below.",
];

export const TerminalSimulator: React.FC<TerminalSimulatorProps> = ({
  value,
  onChange,
  onSubmit,
  onCommand,
  prompt = "student@cyber:~$",
  placeholder = "type a command…",
  disabled = false,
  initialLines,
  minHeight = 220,
  runLabel = "Run",
}) => {
  const [lines, setLines] = useState<TerminalLine[]>(
    initialLines ?? [
      { kind: "system", text: "Cyber Shell v1.0 — simulated environment" },
      { kind: "system", text: 'Type "help" for available commands.' },
    ]
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [lines]);

  const run = async () => {
    const command = value;
    if (disabled || !command.trim()) return;

    setLines((prev) => [...prev, { kind: "input", text: `${prompt} ${command}` }]);
    onSubmit?.(command);
    onChange("");

    let output: string[] = [];
    try {
      if (onCommand) {
        output = await onCommand(command);
      } else if (command.trim().toLowerCase() === "help") {
        output = BUILTIN_HELP;
      }
    } catch (err) {
      setLines((prev) => [
        ...prev,
        { kind: "error", text: err instanceof Error ? err.message : "command failed" },
      ]);
      return;
    }

    if (output.length > 0) {
      setLines((prev) => [
        ...prev,
        ...output.map((text) => ({ kind: "output" as const, text })),
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void run();
    }
  };

  return (
    <div
      className="w-full border-[3px] border-[#0A0A0A] bg-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] overflow-hidden"
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#171717] border-b-2 border-[#0A0A0A]">
        <div className="flex items-center gap-2 text-[#22C55E]">
          <TerminalIcon className="w-4 h-4" />
          <span className="font-mono text-xs font-bold">terminal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#FACC15]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        </div>
      </div>

      {/* Output */}
      <div
        ref={scrollRef}
        dir="ltr"
        style={{ minHeight }}
        className="p-3 overflow-y-auto font-mono text-[12.5px] leading-relaxed text-left"
      >
        {lines.map((line, idx) => (
          <div
            key={idx}
            className={
              line.kind === "input"
                ? "text-white"
                : line.kind === "error"
                ? "text-[#FF6B6B]"
                : line.kind === "system"
                ? "text-[#8B5CF6]"
                : "text-[#22C55E]"
            }
            style={{ whiteSpace: "pre-wrap" }}
          >
            {line.text}
          </div>
        ))}

        {/* Prompt + input */}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[#FACC15] shrink-0">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            dir="ltr"
            value={value}
            disabled={disabled}
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 min-w-0 bg-transparent text-[#22C55E] placeholder:text-gray-600 outline-none font-mono caret-[#22C55E]"
          />
        </div>
      </div>

      {/* Run button (mobile-friendly) */}
      {!disabled && (
        <div className="px-3 py-2 border-t-2 border-[#262626] flex justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void run();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#22C55E] text-[#0A0A0A] font-black text-xs border-2 border-[#0A0A0A] hover:bg-[#34D399] cursor-pointer"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            {runLabel}
          </button>
        </div>
      )}
    </div>
  );
};
