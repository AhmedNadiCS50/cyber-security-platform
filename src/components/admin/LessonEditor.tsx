"use client";

import React, { useState } from "react";
import { AdminModal, Field, inputClass, textareaClass, helpClass } from "./ui";
import { QuestionEditor, createQuestion } from "./QuestionEditor";
import { useContent } from "@/context/ContentContext";
import type { Lesson, Question, QuestionType } from "@/lib/seedData";
import { Save, Plus } from "lucide-react";

export function createLesson(levelId: string, order: number): Lesson {
  return {
    id: `lesson-${Date.now()}`,
    levelId,
    order,
    titleAr: "",
    titleEn: "",
    descriptionAr: "",
    descriptionEn: "",
    xp: 50,
    passScore: 70,
    published: true,
    quiz: [],
    resources: [],
  };
}

/** Accepts a full YouTube URL or a bare video id and returns the id. */
export function parseYoutubeId(input: string): string {
  const value = (input || "").trim();
  if (!value) return "";
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([\w-]{6,})/,
    /(?:youtu\.be\/)([\w-]{6,})/,
    /(?:youtube\.com\/embed\/)([\w-]{6,})/,
    /(?:youtube\.com\/shorts\/)([\w-]{6,})/,
  ];
  for (const p of patterns) {
    const m = value.match(p);
    if (m) return m[1];
  }
  return value; // assume it is already an id
}

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq", label: "اختيار من متعدد" },
  { value: "terminal", label: "طرفية" },
  { value: "flag", label: "Flag" },
  { value: "code", label: "كود" },
];

interface LessonEditorProps {
  levelId: string;
  levelTitle: string;
  lesson?: Lesson;
  /** Order used when creating a brand-new lesson. */
  nextOrder?: number;
  onClose: () => void;
  onSaved?: () => void;
}

export const LessonEditor: React.FC<LessonEditorProps> = ({
  levelId,
  levelTitle,
  lesson,
  nextOrder = 1,
  onClose,
  onSaved,
}) => {
  const { saveLesson } = useContent();
  const isNew = !lesson;

  const [draft, setDraft] = useState<Lesson>(
    () => lesson || createLesson(levelId, nextOrder)
  );
  const [youtubeInput, setYoutubeInput] = useState<string>(lesson?.youtubeId || "");
  const [newQType, setNewQType] = useState<QuestionType>("mcq");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Lesson>) => setDraft((d) => ({ ...d, ...p }));

  const setQuestion = (idx: number, q: Question) =>
    patch({ quiz: draft.quiz.map((item, i) => (i === idx ? q : item)) });

  const removeQuestion = (idx: number) =>
    patch({ quiz: draft.quiz.filter((_, i) => i !== idx) });

  const moveQuestion = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.quiz.length) return;
    const next = [...draft.quiz];
    [next[idx], next[target]] = [next[target], next[idx]];
    patch({ quiz: next });
  };

  const handleSave = async () => {
    if (!draft.titleAr.trim()) {
      setError("من فضلك اكتب عنوان الدرس بالعربي.");
      return;
    }
    setSaving(true);
    setError(null);

    const value: Lesson = {
      id: draft.id || `lesson-${Date.now()}`,
      levelId,
      order: Number(draft.order) || 0,
      titleAr: draft.titleAr.trim(),
      titleEn: draft.titleEn.trim() || draft.titleAr.trim(),
      descriptionAr: draft.descriptionAr || "",
      descriptionEn: draft.descriptionEn || draft.descriptionAr || "",
      youtubeId: parseYoutubeId(youtubeInput) || undefined,
      contentAr: draft.contentAr?.trim() ? draft.contentAr : undefined,
      contentEn: draft.contentEn?.trim() ? draft.contentEn : undefined,
      resources: draft.resources,
      xp: Number(draft.xp) || 0,
      passScore: Number(draft.passScore) || 70,
      published: draft.published,
      quiz: draft.quiz,
    };

    const res = await saveLesson(levelId, value);
    setSaving(false);
    if (res.ok) {
      onSaved?.();
      onClose();
    } else {
      setError(res.error || "تعذر الحفظ");
    }
  };

  return (
    <AdminModal
      title={isNew ? "إضافة درس جديد" : "تعديل الدرس"}
      subtitle={levelTitle}
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <span className="text-xs font-bold text-gray-500">
            {draft.quiz.length} سؤال في الاختبار
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border-2 border-[#0A0A0A] font-black text-sm hover:bg-[#FAF6EC] cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#3346F0] text-white border-2 border-[#0A0A0A] font-black text-sm shadow-[3px_3px_0px_#0A0A0A] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] disabled:opacity-60 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {saving ? "جاري الحفظ..." : "حفظ الدرس"}
            </button>
          </div>
        </div>
      }
    >
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-2 border-red-700 text-red-800 font-bold text-xs">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="عنوان الدرس (عربي)">
            <input
              type="text"
              value={draft.titleAr}
              onChange={(e) => patch({ titleAr: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Lesson title (English)">
            <input
              type="text"
              dir="ltr"
              value={draft.titleEn}
              onChange={(e) => patch({ titleEn: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="وصف قصير (عربي)">
            <textarea
              rows={2}
              value={draft.descriptionAr}
              onChange={(e) => patch({ descriptionAr: e.target.value })}
              className={textareaClass}
            />
          </Field>
          <Field label="Short description (English)">
            <textarea
              dir="ltr"
              rows={2}
              value={draft.descriptionEn}
              onChange={(e) => patch({ descriptionEn: e.target.value })}
              className={textareaClass}
            />
          </Field>
        </div>

        <Field
          label="رابط فيديو يوتيوب (اختياري)"
          help="الصق الرابط كاملاً أو معرّف الفيديو فقط. اتركه فارغاً لو الدرس مكتوب فقط."
        >
          <input
            type="text"
            dir="ltr"
            value={youtubeInput}
            onChange={(e) => setYoutubeInput(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=... أو مجرد المعرّف"
            className={inputClass}
          />
          {parseYoutubeId(youtubeInput) && (
            <p className={helpClass}>
              سيُستخدم الفيديو: <span className="font-mono">{parseYoutubeId(youtubeInput)}</span>
            </p>
          )}
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="محتوى الدرس (عربي)" help="يدعم **العريض** و `الكود`.">
            <textarea
              rows={6}
              value={draft.contentAr || ""}
              onChange={(e) => patch({ contentAr: e.target.value })}
              className={textareaClass}
            />
          </Field>
          <Field label="Lesson content (English)" help="Supports **bold** and `code`.">
            <textarea
              dir="ltr"
              rows={6}
              value={draft.contentEn || ""}
              onChange={(e) => patch({ contentEn: e.target.value })}
              className={textareaClass}
            />
          </Field>
        </div>

        {/* ─── Resources / References ─── */}
        <Field
          label="المصادر والمراجع (اختياري)"
          help="أضف روابط لمصادر إضافية: مقالات، وثائق، فيديوهات خارجية..."
        >
          <div className="space-y-2">
            {draft.resources?.map((res, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="عنوان المورد"
                  value={res.title}
                  onChange={(e) => {
                    const next = [...(draft.resources || [])];
                    next[idx] = { ...next[idx], title: e.target.value };
                    patch({ resources: next });
                  }}
                  className="flex-1"
                />
                <input
                  type="url"
                  placeholder="https://example.com"
                  dir="ltr"
                  value={res.url}
                  onChange={(e) => {
                    const next = [...(draft.resources || [])];
                    next[idx] = { ...next[idx], url: e.target.value };
                    patch({ resources: next });
                  }}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = [...(draft.resources || [])];
                    next.splice(idx, 1);
                    patch({ resources: next });
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="حذف"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => patch({ resources: [...(draft.resources || []), { title: "", url: "" }] })}
              className="inline-flex items-center gap-1 px-3 py-2 bg-gray-100 border-2 border-dashed border-gray-400 font-black text-xs hover:border-[#3346F0] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              إضافة مورد
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="الترتيب">
            <input
              type="number"
              value={draft.order}
              onChange={(e) => patch({ order: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
          <Field label="نقاط XP">
            <input
              type="number"
              value={draft.xp}
              onChange={(e) => patch({ xp: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
          <Field label="درجة النجاح %">
            <input
              type="number"
              value={draft.passScore}
              onChange={(e) => patch({ passScore: Number(e.target.value) })}
              className={inputClass}
            />
          </Field>
          <Field label="الحالة">
            <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-[#0A0A0A] cursor-pointer">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => patch({ published: e.target.checked })}
                className="w-4 h-4 accent-[#3346F0]"
              />
              <span className="text-xs font-black">
                {draft.published ? "منشور" : "مسودّة"}
              </span>
            </label>
          </Field>
        </div>

        {/* ─── Quiz builder ─────────────────────────────── */}
        <div className="pt-3 border-t-2 border-dashed border-[#0A0A0A]">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h4 className="font-black text-lg text-[#0A0A0A]">منشئ الأسئلة</h4>
            <div className="flex items-center gap-2">
              <select
                value={newQType}
                onChange={(e) => setNewQType(e.target.value as QuestionType)}
                className={`${inputClass} py-1.5 w-auto`}
              >
                {QUESTION_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => patch({ quiz: [...draft.quiz, createQuestion(newQType)] })}
                className="inline-flex items-center gap-1 px-3 py-2 bg-[#FACC15] border-2 border-[#0A0A0A] font-black text-xs hover:bg-[#e6b800] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                إضافة سؤال
              </button>
            </div>
          </div>

          {draft.quiz.length === 0 ? (
            <p className="text-sm font-bold text-gray-500 text-center py-6 bg-[#FAF6EC] border-2 border-dashed border-gray-400">
              لا توجد أسئلة بعد. اضغط «إضافة سؤال» لبناء اختبار الدرس.
            </p>
          ) : (
            <div className="space-y-4">
              {draft.quiz.map((q, i) => (
                <QuestionEditor
                  key={q.id}
                  question={q}
                  index={i}
                  onChange={(nq) => setQuestion(i, nq)}
                  onRemove={() => removeQuestion(i)}
                  onMove={(dir) => moveQuestion(i, dir)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminModal>
  );
};