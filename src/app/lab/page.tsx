"use client";

import React, { useMemo, useState, useSyncExternalStore } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import {
  TerminalSimulator,
  type TerminalLine,
} from "@/components/question/TerminalSimulator";
import { XP_RULES } from "@/lib/xpRules";
import {
  Flag,
  RotateCcw,
  Target,
  CheckCircle2,
  XCircle,
  Compass,
  Terminal as TerminalIcon,
} from "lucide-react";

// ─── Virtual file system ──────────────────────────────────────────────────────

type FsFile = { type: "file"; content: string };
type FsDir = { type: "dir"; children: Record<string, FsNode> };
type FsNode = FsFile | FsDir;

const FLAG = "CYBER{l4b_fl4g_c4ptur3d}";
const HOME = "/home/student";

const FS: FsDir = {
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        student: {
          type: "dir",
          children: {
            "readme.txt": {
              type: "file",
              content:
                "Welcome to the Cyber Lab sandbox!\nYour mission: find and read the file flag.txt.\n(psst… hidden directories start with a dot — try `ls -a`)",
            },
            "notes.txt": {
              type: "file",
              content:
                "Quick cheatsheet:\n  ls    list files\n  cd    change directory\n  cat   print a file\n  pwd   print working directory",
            },
            Documents: {
              type: "dir",
              children: {
                "passwords.txt": {
                  type: "file",
                  content: "admin:$2y$10$FAKEHASHfakehashFAKEhashfake",
                },
              },
            },
            ".secret": {
              type: "dir",
              children: {
                "flag.txt": { type: "file", content: FLAG },
              },
            },
          },
        },
      },
    },
  },
};

function resolvePath(cwd: string, target?: string): string {
  let t = target && target.trim() ? target.trim() : ".";
  if (t === "~") t = HOME;
  if (!t.startsWith("/")) t = cwd === "/" ? `/${t}` : `${cwd}/${t}`;
  const out: string[] = [];
  for (const part of t.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") out.pop();
    else out.push(part);
  }
  return "/" + out.join("/");
}

function getNode(path: string): FsNode | null {
  const parts = path.split("/").filter(Boolean);
  let node: FsNode = FS;
  for (const part of parts) {
    if (node.type !== "dir") return null;
    const child: FsNode | undefined = node.children[part];
    if (!child) return null;
    node = child;
  }
  return node;
}

// ─── Component ────────────────────────────────────────────────────────────────

// Today's date is a client-only external value: the server snapshot is a
// constant so `new Date()` is never evaluated during prerendering.
const emptySubscribe = () => () => {};
const getTodayClientSnapshot = () => new Date().toISOString().split("T")[0];
const getTodayServerSnapshot = () => "";

export default function LabPage() {
  const { t } = useTranslation();
  const { user, recordLabSession } = useAuth();

  const [cwd, setCwd] = useState(HOME);
  const [mode, setMode] = useState<"mission" | "free">("mission");
  const [sessionKey, setSessionKey] = useState(0);

  const [flagInput, setFlagInput] = useState("");
  const [flagResult, setFlagResult] = useState<"idle" | "correct" | "wrong">("idle");

  const today = useSyncExternalStore(
    emptySubscribe,
    getTodayClientSnapshot,
    getTodayServerSnapshot
  );
  const sessionsToday =
    user && user.labSessionDate === today ? user.labSessionsToday || 0 : 0;
  const limitReached = Boolean(user) && sessionsToday >= XP_RULES.LAB_DAILY_LIMIT;

  const shortCwd = cwd.replace(HOME, "~") || "~";

  const initialLines = useMemo<TerminalLine[]>(
    () => [
      { kind: "system", text: "Cyber Shell v1.0 — sandboxed lab environment" },
      { kind: "system", text: 'Type "help" to list available commands.' },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey]
  );

  const runCommand = (raw: string): string[] => {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        return [
          "Available commands:",
          "  ls [-a]      list directory contents ( -a shows hidden files )",
          "  cd <dir>     change directory ( cd .. to go up )",
          "  pwd          print current directory",
          "  cat <file>   print a file's contents",
          "  whoami       print the current user",
        ];

      case "pwd":
        return [cwd];

      case "whoami":
        return ["student"];

      case "ls": {
        const showAll = args.some((a) => /^-[a-z]*a[a-z]*$/i.test(a));
        const targetArg = args.find((a) => !a.startsWith("-"));
        const path = resolvePath(cwd, targetArg);
        const node = getNode(path);
        if (!node) return [`ls: cannot access '${targetArg || path}': No such file or directory`];
        if (node.type === "file") return [path.split("/").filter(Boolean).pop() || path];
        const names = Object.keys(node.children).filter(
          (n) => showAll || !n.startsWith(".")
        );
        if (names.length === 0) return [];
        return [
          names
            .map((n) => (node.children[n].type === "dir" ? `${n}/` : n))
            .join("   "),
        ];
      }

      case "cd": {
        if (!args[0] || args[0] === "~") {
          setCwd(HOME);
          return [];
        }
        const path = resolvePath(cwd, args[0]);
        const node = getNode(path);
        if (!node) return [`cd: ${args[0]}: No such file or directory`];
        if (node.type !== "dir") return [`cd: ${args[0]}: Not a directory`];
        setCwd(path);
        return [];
      }

      case "cat": {
        if (!args[0]) return ["cat: missing operand"];
        const path = resolvePath(cwd, args[0]);
        const node = getNode(path);
        if (!node) return [`cat: ${args[0]}: No such file or directory`];
        if (node.type === "dir") return [`cat: ${args[0]}: Is a directory`];
        return node.content.split("\n");
      }

      default:
        return [`${cmd}: command not found. Type "help" to see available commands.`];
    }
  };

  const resetTerminal = () => {
    setCwd(HOME);
    setSessionKey((k) => k + 1);
    setFlagInput("");
    setFlagResult("idle");
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = flagInput.trim();
    if (!value) return;

    if (value.toLowerCase() === FLAG.toLowerCase()) {
      setFlagResult("correct");
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FACC15", "#3346F0", "#FF6B00", "#22C55E"],
      });
      if (!limitReached) {
        await recordLabSession(XP_RULES.LAB_SESSION);
      }
    } else {
      setFlagResult("wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge variant="green" size="md" className="mb-2">
            <TerminalIcon className="w-4 h-4 text-[#0A0A0A]" />
            <span>{t("lab.subtitle")}</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>{t("lab.title")}</HandDrawnUnderline>
          </h1>
          <div className="mt-3 inline-flex items-center gap-2">
            <Badge variant="yellow" size="sm">
              {t("lab.sessions_today")}: {sessionsToday} / {XP_RULES.LAB_DAILY_LIMIT}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================== */}
          {/* LEFT: TERMINAL (7 COLS)                     */}
          {/* =========================================== */}
          <div className="lg:col-span-7">
            <TerminalSimulator
              key={sessionKey}
              value={""}
              onChange={() => {}}
              onCommand={runCommand}
              prompt={`student@cyber:${shortCwd}$`}
              initialLines={initialLines}
              placeholder={t("question.terminal_placeholder")}
              runLabel={t("question.run")}
              minHeight={300}
            />
          </div>

          {/* =========================================== */}
          {/* RIGHT: MISSION & FLAG (5 COLS)              */}
          {/* =========================================== */}
          <div className="lg:col-span-5 space-y-6">
            {/* Mode toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("mission")}
                className={`p-2.5 font-black text-xs border-2 transition-all cursor-pointer ${
                  mode === "mission"
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[2px_2px_0px_#FACC15]"
                    : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FAF6EC]"
                }`}
              >
                🎯 {t("lab.mission_title")}
              </button>
              <button
                onClick={() => setMode("free")}
                className={`p-2.5 font-black text-xs border-2 transition-all cursor-pointer ${
                  mode === "free"
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[2px_2px_0px_#FACC15]"
                    : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FAF6EC]"
                }`}
              >
                <Compass className="w-4 h-4 inline-block me-1" />
                {t("lab.freeplay")}
              </button>
            </div>

            {mode === "mission" ? (
              <Card variant="white" className="p-6 shadow-[5px_5px_0px_#0A0A0A]">
                <h3 className="font-black text-lg text-[#0A0A0A] mb-2 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#FF6B00]" />
                  {t("lab.mission_title")}
                </h3>
                <p className="text-xs font-bold text-gray-700 leading-relaxed mb-4">
                  {t("lab.mission_desc")}
                </p>

                <h4 className="font-black text-xs uppercase tracking-wider text-[#3346F0] mb-2">
                  {t("lab.objectives")}
                </h4>
                <ul className="space-y-1.5 text-xs font-bold text-gray-800 mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-[#3346F0] font-black">1.</span>
                    {t("lab.objective_1")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3346F0] font-black">2.</span>
                    {t("lab.objective_2")}
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#3346F0] font-black">3.</span>
                    {t("lab.objective_3")}
                  </li>
                </ul>

                <div className="p-3 bg-yellow-50 border-2 border-[#FACC15] text-xs font-bold text-gray-800">
                  💡 {t("lab.hint")}
                  <br />
                  <span className="text-gray-600">{t("lab.help_hint")}</span>
                </div>

                {/* Flag submission */}
                <form onSubmit={handleFlagSubmit} className="mt-4 space-y-2">
                  <label className="block text-xs font-black text-[#3346F0] flex items-center gap-1.5">
                    <Flag className="w-3.5 h-3.5" />
                    {t("lab.enter_flag")}
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    spellCheck={false}
                    value={flagInput}
                    disabled={flagResult === "correct"}
                    onChange={(e) => {
                      setFlagInput(e.target.value);
                      setFlagResult("idle");
                    }}
                    placeholder="CYBER{...}"
                    className="w-full p-3 bg-white border-2 border-[#0A0A0A] font-mono text-sm font-bold outline-none focus:border-[#3346F0] disabled:opacity-60"
                  />

                  {flagResult === "correct" && (
                    <div className="p-3 bg-green-100 border-2 border-green-700 text-green-900 font-black text-xs flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p>{t("lab.solved_title")}</p>
                        <p className="font-bold mt-0.5">
                          {limitReached ? t("lab.limit_reached") : t("lab.solved_msg")}
                        </p>
                      </div>
                    </div>
                  )}

                  {flagResult === "wrong" && (
                    <div className="p-2.5 bg-red-100 border-2 border-red-700 text-red-900 font-black text-xs flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>{t("lab.wrong_flag")}</span>
                    </div>
                  )}

                  {limitReached && flagResult !== "correct" && (
                    <div className="p-2.5 bg-orange-50 border-2 border-[#FF6B00] text-[#0A0A0A] font-bold text-xs">
                      ⚠️ {t("lab.limit_reached")}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full"
                    disabled={flagResult === "correct"}
                  >
                    {t("challenges.submit_btn")}
                  </Button>
                </form>
              </Card>
            ) : (
              <Card variant="cream" className="p-6 shadow-[5px_5px_0px_#0A0A0A]">
                <h3 className="font-black text-lg text-[#0A0A0A] mb-2 flex items-center gap-2">
                  <Compass className="w-5 h-5 text-[#3346F0]" />
                  {t("lab.freeplay")}
                </h3>
                <p className="text-xs font-bold text-gray-700 leading-relaxed">
                  {t("lab.freeplay_desc")}
                </p>
                <p className="mt-3 text-xs font-bold text-gray-600">
                  {t("lab.help_hint")}
                </p>
              </Card>
            )}

            <Button
              variant="dark"
              size="md"
              className="w-full"
              onClick={resetTerminal}
              icon={<RotateCcw className="w-4 h-4" />}
            >
              {t("lab.new_session")}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
