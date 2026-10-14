"use client";

import React, { useState } from "react";
import { AdminModal, Field, inputClass, textareaClass, selectClass } from "./ui";
import { QuestionEditor, createQuestion } from "./QuestionEditor";
import { useContent } from "@/context/ContentContext";
import type { Challenge, Question } from "@/lib/seedData";

export function createChallenge(): Challenge {
  return {
    id: `challenge-${Date.now()}`,
    titleAr: "",
    titleEn: "",
    difficulty: "easy",
    xp: 100,
    hintAr: "",
    hintEn: "",
    published: true,
    question: createQuestion("flag"),
  };
}

interface ChallengeEditorProps {
  challenge?: Challenge;
  onClose: () => void;
  onSaved?: () => void;
}

export const ChallengeEditor: React.FC<ChallengeEditorProps> = ({
  challenge,
  onClose,
  onSaved,
}) => {
  const { saveChallenge } = useContent();
  const isNew = !challenge;

  const [draft, setDraft] = useState<Challenge>(() => challenge || createChallenge());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<Challenge>) => setDraft((d) => ({ ...d, ...p }));

  const handleSave = async () => {
    if (!draft.titleAr.trim()) {
      setError("اكتب عنوان التحدي بالعربي.");
      return;
    }
    setSaving(true);
    setError(null);
    const value: Challenge = {
      ...draft,
      id: draft.id || `challenge-${Date.now()}`,
      titleAr: draft.titleAr.trim(),
      titleEn: draft.titleEn.trim() || draft.titleAr.trim(),
      xp: Number(draft.xp) || 0,
      hintAr: draft.hintAr || "",
      hintEn: draft.hintEn || draft.hintAr || "",
      question: draft.question,
    };
    const res = await saveChallenge(value);
    setSaving(false);
    if (res.ok) {
      onSaved?.();
      onClose();
    } else {
      setError(res.error || "تعذر الحفظ");
    }
  };

  const setQuestion = (q: Question) => patch({ question: q });

  return (
    <AdminModal
      title={isNew ? "إضافة تحدٍّ جديد" : "تعديل التحدي"}
      subtitle="تحدي يومي (CTF) بنقاط XP ومكافأة."
      onClose={onClose}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-end gap-2">
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
            className="px-4 py-2 bg-[#3346F0] text-white border-2 border-[#0A0A0A] font-black text-sm shadow-[3px_3px_0px_#0A0A0A] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
          >
            {saving ? "جارٍ الحفظ…" : "حفظ التحدي"}
          </button>
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
          <Field label="عنوان التحدي (عربي)">
            <input
              type="text"
              value={draft.titleAr}
              onChange={(e) => patch({ titleAr: e.target.value })}
              className={inputClass}
            />
          </Field>
          <Field label="Challenge title (English)">
            <input
              type="text"
              dir="ltr"
              value={draft.titleEn}
              onChange={(e) => patch({ titleEn: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Field label="الصعوبة">
            <select
              value={draft.difficulty}
              onChange={(e) =>
                patch({ difficulty: e.target.value as Challenge["difficulty"] })
              }
              className={selectClass}
            >
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>
          </Field>
          <Field label="نقاط XP">
            <input
              type="number"
              value={draft.xp}
              onChange={(e) => patch({ xp: Number(e.target.value) })}
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
          <Field label="تاريخ النشر (اختياري)">
            <input
              type="date"
              value={draft.publishDate || ""}
              onChange={(e) => patch({ publishDate: e.target.value })}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="تلميح (عربي)">
            <textarea
              rows={2}
              value={draft.hintAr}
              onChange={(e) => patch({ hintAr: e.target.value })}
              className={textareaClass}
            />
          </Field>
          <Field label="Hint (English)">
            <textarea
              dir="ltr"
              rows={2}
              value={draft.hintEn}
              onChange={(e) => patch({ hintEn: e.target.value })}
              className={textareaClass}
            />
          </Field>
        </div>

        <div className="pt-3 border-t-2 border-dashed border-[#0A0A0A]">
          <h4 className="font-black text-lg text-[#0A0A0A] mb-3">محتوى التحدي</h4>
          <QuestionEditor
            question={draft.question}
            index={0}
            onChange={setQuestion}
            onRemove={() => patch({ question: createQuestion("flag") })}
          />
        </div>
      </div>
    </AdminModal>
  );
};
