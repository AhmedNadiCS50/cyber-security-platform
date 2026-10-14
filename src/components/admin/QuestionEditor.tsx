"use client";

import React from "react";
import { type Question, type QuestionType } from "@/lib/seedData";
import { Field, inputClass, selectClass, textareaClass } from "./ui";
import { Trash2 } from "lucide-react";

/** Build a blank question of the given type. */
export function createQuestion(type: QuestionType = "mcq"): Question {
  const base = {
    id: `q-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    questionAr: "",
    questionEn: "",
    explanationAr: "",
    explanationEn: "",
  };
  switch (type) {
    case "mcq":
      return {
        ...base,
        options: [
          { ar: "", en: "" },
          { ar: "", en: "" },
          { ar: "", en: "" },
        ],
        correctIndex: 0,
      };
    case "terminal":
      return {
        ...base,
        terminalPromptAr: "",
        terminalPromptEn: "",
        acceptedAnswers: [],
      };
    case "flag":
      return { ...base, expectedFlag: "" };
    default:
      return { ...base, language: "python", starterCode: "", expectedPattern: "" };
  }
}

const TYPE_OPTIONS: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "اختيار من متعدد" },
  { value: "terminal", label: "طرفية (أوامر)" },
  { value: "flag", label: "التقاط Flag" },
  { value: "code", label: "كتابة كود" },
];

interface QuestionEditorProps {
  question: Question;
  index: number;
  onChange: (q: Question) => void;
  onRemove: () => void;
  onMove?: (dir: -1 | 1) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({
  question,
  index,
  onChange,
  onRemove,
  onMove,
}) => {
  const q = question;
  const patch = (p: Partial<Question>) => onChange({ ...q, ...p });

  const setType = (type: QuestionType) => {
    const fresh = createQuestion(type);
    onChange({
      ...fresh,
      id: q.id,
      questionAr: q.questionAr,
      questionEn: q.questionEn,
      explanationAr: q.explanationAr,
      explanationEn: q.explanationEn,
    });
  };

  const options = q.options || [];

  const setOption = (i: number, patchOpt: { ar?: string; en?: string }) => {
    patch({ options: options.map((o, idx) => (idx === i ? { ...o, ...patchOpt } : o)) });
  };

  const removeOption = (i: number) => {
    const next = options.filter((_, idx) => idx !== i);
    const nextCorrect =
      q.correctIndex === undefined
        ? 0
        : q.correctIndex > i
        ? q.correctIndex - 1
        : q.correctIndex;
    patch({ options: next, correctIndex: Math.max(0, Math.min(nextCorrect, next.length - 1)) });
  };

  return (
    <div className="p-4 bg-[#FAF6EC] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-[#0A0A0A] text-white font-black text-xs flex items-center justify-center shrink-0">
            {String(index + 1).padStart(2, "0")}
          </span>
          <select
            value={q.type}
            onChange={(e) => setType(e.target.value as QuestionType)}
            className={`${selectClass} py-1.5`}
          >
            {TYPE_OPTIONS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1">
          {onMove && (
            <>
              <button
                type="button"
                onClick={() => onMove(-1)}
                className="px-2 py-1 bg-white border border-[#0A0A0A] text-xs font-black hover:bg-[#FACC15] cursor-pointer"
                title="لأعلى"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => onMove(1)}
                className="px-2 py-1 bg-white border border-[#0A0A0A] text-xs font-black hover:bg-[#FACC15] cursor-pointer"
                title="لأسفل"
              >
                ↓
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-700 cursor-pointer"
            title="حذف السؤال"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="نص السؤال (عربي)">
          <textarea
            rows={2}
            value={q.questionAr}
            onChange={(e) => patch({ questionAr: e.target.value })}
            className={textareaClass}
          />
        </Field>
        <Field label="Question text (English)">
          <textarea
            dir="ltr"
            rows={2}
            value={q.questionEn}
            onChange={(e) => patch({ questionEn: e.target.value })}
            className={textareaClass}
          />
        </Field>
      </div>

      {/* ─── MCQ ─────────────────────────────────────────── */}
      {q.type === "mcq" && (
        <div className="mt-3">
          <p className="text-xs font-black text-[#0A0A0A] mb-1.5">
            الخيارات (اختر الدائرة أمام الإجابة الصحيحة)
          </p>
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={`correct-${q.id}`}
                  checked={q.correctIndex === i}
                  onChange={() => patch({ correctIndex: i })}
                  className="w-4 h-4 accent-[#3346F0] shrink-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={opt.ar}
                  onChange={(e) => setOption(i, { ar: e.target.value })}
                  placeholder="الخيار بالعربي"
                  className={inputClass}
                />
                <input
                  type="text"
                  dir="ltr"
                  value={opt.en}
                  onChange={(e) => setOption(i, { en: e.target.value })}
                  placeholder="Option (EN)"
                  className={inputClass}
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(i)}
                    className="p-1.5 bg-white hover:bg-red-100 text-red-700 border border-[#0A0A0A] cursor-pointer shrink-0"
                    title="حذف الخيار"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => patch({ options: [...options, { ar: "", en: "" }] })}
            className="mt-2 px-3 py-1.5 bg-white border-2 border-[#0A0A0A] text-xs font-black hover:bg-[#FACC15] cursor-pointer"
          >
            + إضافة خيار
          </button>
        </div>
      )}

      {/* ─── TERMINAL ────────────────────────────────────── */}
      {q.type === "terminal" && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="نص المطلوب (عربي)">
              <input
                type="text"
                value={q.terminalPromptAr || ""}
                onChange={(e) => patch({ terminalPromptAr: e.target.value })}
                className={inputClass}
              />
            </Field>
            <Field label="Task prompt (English)">
              <input
                type="text"
                dir="ltr"
                value={q.terminalPromptEn || ""}
                onChange={(e) => patch({ terminalPromptEn: e.target.value })}
                className={inputClass}
              />
            </Field>
          </div>
          <Field
            label="الأوامر المقبولة"
            help="كل سطر = إجابة صحيحة. المقارنة تتجاهل حالة الأحرف والمسافات الزائدة."
          >
            <textarea
              dir="ltr"
              rows={3}
              value={(q.acceptedAnswers || []).join("\n")}
              onChange={(e) =>
                patch({
                  acceptedAnswers: e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              placeholder={"ls\nls -la"}
              className={`${textareaClass} font-mono`}
            />
          </Field>
        </div>
      )}

      {/* ─── FLAG ────────────────────────────────────────── */}
      {q.type === "flag" && (
        <div className="mt-3">
          <Field
            label="الفلاج المتوقع"
            help="مثال: CYBER{flag_here} — المقارنة تتجاهل حالة الأحرف."
          >
            <input
              type="text"
              dir="ltr"
              value={q.expectedFlag || ""}
              onChange={(e) => patch({ expectedFlag: e.target.value })}
              className={`${inputClass} font-mono`}
            />
          </Field>
        </div>
      )}

      {/* ─── CODE ────────────────────────────────────────── */}
      {q.type === "code" && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="اللغة">
              <input
                type="text"
                dir="ltr"
                value={q.language || ""}
                onChange={(e) => patch({ language: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </Field>
            <Field label="نمط التحقق (Regex)" help="اختياري: تعبير نمطي يجب أن يطابق كود الطالب.">
              <input
                type="text"
                dir="ltr"
                value={q.expectedPattern || ""}
                onChange={(e) => patch({ expectedPattern: e.target.value })}
                className={`${inputClass} font-mono`}
              />
            </Field>
          </div>
          <Field label="الكود المبدئي">
            <textarea
              dir="ltr"
              rows={3}
              value={q.starterCode || ""}
              onChange={(e) => patch({ starterCode: e.target.value })}
              className={`${textareaClass} font-mono`}
            />
          </Field>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <Field label="الشرح (عربي)">
          <textarea
            rows={2}
            value={q.explanationAr}
            onChange={(e) => patch({ explanationAr: e.target.value })}
            className={textareaClass}
          />
        </Field>
        <Field label="Explanation (English)">
          <textarea
            dir="ltr"
            rows={2}
            value={q.explanationEn}
            onChange={(e) => patch({ explanationEn: e.target.value })}
            className={textareaClass}
          />
        </Field>
      </div>
    </div>
  );
};
