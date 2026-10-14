"use client";

import React from "react";
import { useTranslation } from "@/context/LanguageContext";
import type { Question } from "@/lib/seedData";
import { AnswerValue, checkAnswer } from "@/lib/questionUtils";
import { TerminalSimulator } from "./TerminalSimulator";
import { CodeEditor } from "./CodeEditor";
import { CheckCircle2, Flag, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: Question;
  index: number;
  answer: AnswerValue | undefined;
  onAnswer: (answer: AnswerValue) => void;
  submitted: boolean;
  /** Show the explanation once submitted (default true). */
  showExplanation?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question: q,
  index,
  answer,
  onAnswer,
  submitted,
  showExplanation = true,
}) => {
  const { t, locale } = useTranslation();
  const isCorrect = submitted && checkAnswer(q, answer);

  const questionText = locale === "ar" ? q.questionAr : q.questionEn;
  const explanation = locale === "ar" ? q.explanationAr : q.explanationEn;

  const typeLabel =
    q.type === "mcq"
      ? t("question.type_mcq")
      : q.type === "terminal"
      ? t("question.type_terminal")
      : q.type === "flag"
      ? t("question.type_flag")
      : t("question.type_code");

  return (
    <div className="p-5 bg-[#FAF6EC] border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2 min-w-0">
          <span className="w-7 h-7 shrink-0 bg-[#0A0A0A] text-white font-black text-xs flex items-center justify-center">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-black text-base sm:text-lg text-[#0A0A0A]">{questionText}</h3>
        </div>
        <span className="shrink-0 text-[10px] font-black uppercase tracking-wide bg-white border border-[#0A0A0A] px-2 py-0.5">
          {typeLabel}
        </span>
      </div>

      {/* ── MCQ ─────────────────────────────────────────── */}
      {q.type === "mcq" && q.options && (
        <div className="space-y-2 mt-4">
          {q.options.map((opt, optIndex) => {
            const isSelected = answer?.type === "mcq" && answer.index === optIndex;
            const isRight = optIndex === q.correctIndex;

            let style = "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FACC15]";
            if (submitted) {
              if (isRight) style = "bg-green-100 text-green-900 border-green-700 font-black";
              else if (isSelected) style = "bg-red-100 text-red-900 border-red-700";
            } else if (isSelected) {
              style = "bg-[#3346F0] text-white border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]";
            }

            return (
              <button
                key={optIndex}
                type="button"
                disabled={submitted}
                onClick={() => onAnswer({ type: "mcq", index: optIndex })}
                className={`w-full text-start p-3 border-2 font-extrabold text-sm transition-all flex items-center justify-between cursor-pointer ${style}`}
              >
                <span>{locale === "ar" ? opt.ar : opt.en}</span>
                {submitted && isRight && <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />}
                {submitted && isSelected && !isRight && <XCircle className="w-4 h-4 text-red-700 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}

      {/* ── TERMINAL ────────────────────────────────────── */}
      {q.type === "terminal" && (
        <div className="mt-4 space-y-3">
          <p className="text-xs font-bold text-[#3346F0]">
            {locale === "ar" ? q.terminalPromptAr : q.terminalPromptEn}
          </p>
          <TerminalSimulator
            value={answer?.type === "terminal" ? answer.text : ""}
            onChange={(text) => onAnswer({ type: "terminal", text })}
            onSubmit={(text) => onAnswer({ type: "terminal", text })}
            disabled={submitted}
            placeholder={t("question.terminal_placeholder")}
            runLabel={t("question.run")}
          />
        </div>
      )}

      {/* ── FLAG ────────────────────────────────────────── */}
      {q.type === "flag" && (
        <div className="mt-4 space-y-2">
          <label className="block text-xs font-black text-[#3346F0] flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" />
            {t("question.flag_label")}
          </label>
          <input
            type="text"
            dir="ltr"
            disabled={submitted}
            spellCheck={false}
            value={answer?.type === "flag" ? answer.text : ""}
            onChange={(e) => onAnswer({ type: "flag", text: e.target.value })}
            placeholder={t("question.flag_placeholder")}
            className={`w-full p-3 bg-white border-2 font-mono text-sm font-bold outline-none ${
              submitted
                ? isCorrect
                  ? "border-green-700 bg-green-50"
                  : "border-red-600 bg-red-50"
                : "border-[#0A0A0A] focus:border-[#3346F0]"
            }`}
          />
        </div>
      )}

      {/* ── CODE ────────────────────────────────────────── */}
      {q.type === "code" && (
        <div className="mt-4 space-y-3">
          <CodeEditor
            value={answer?.type === "code" ? answer.code : q.starterCode || ""}
            onChange={(code) => onAnswer({ type: "code", code })}
            language={q.language || "code"}
            disabled={submitted}
            placeholder={t("question.code_placeholder")}
          />
        </div>
      )}

      {/* ── Feedback + explanation ──────────────────────── */}
      {submitted && (
        <div className="mt-3 space-y-2">
          <div
            className={`p-2.5 border-2 font-black text-xs flex items-center gap-2 ${
              isCorrect
                ? "bg-green-100 border-green-700 text-green-900"
                : "bg-red-100 border-red-700 text-red-900"
            }`}
          >
            {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{isCorrect ? t("learn.quiz_correct") : t("learn.quiz_wrong")}</span>
          </div>
          {showExplanation && (
            <p className="p-3 bg-white border border-[#0A0A0A] text-xs font-bold text-gray-700 leading-relaxed">
              💡 {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
