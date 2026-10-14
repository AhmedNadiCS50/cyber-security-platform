"use client";

import React, { useState } from "react";
import { AdminModal, Field, inputClass, textareaClass } from "./ui";
import { useContent } from "@/context/ContentContext";
import type { Level } from "@/lib/seedData";

interface LevelEditorProps {
  level?: Level;
  nextOrder: number;
  onClose: () => void;
  onSaved?: () => void;
}

export const LevelEditor: React.FC<LevelEditorProps> = ({
  level,
  nextOrder,
  onClose,
  onSaved,
}) => {
  const { saveLevel } = useContent();
  const isNew = !level;

  const [titleAr, setTitleAr] = useState(level?.titleAr || "");
  const [titleEn, setTitleEn] = useState(level?.titleEn || "");
  const [descriptionAr, setDescriptionAr] = useState(level?.descriptionAr || "");
  const [descriptionEn, setDescriptionEn] = useState(level?.descriptionEn || "");
  const [order, setOrder] = useState<number>(level?.order ?? nextOrder);
  const [published, setPublished] = useState<boolean>(level?.published ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!titleAr.trim()) {
      setError("اكتب عنوان المرحلة بالعربي.");
      return;
    }
    setSaving(true);
    setError(null);

    const value: Level = {
      id: level?.id || `level-${Date.now()}`,
      order: Number(order) || 1,
      titleAr: titleAr.trim(),
      titleEn: titleEn.trim() || titleAr.trim(),
      descriptionAr: descriptionAr.trim(),
      descriptionEn: descriptionEn.trim() || descriptionAr.trim(),
      published,
      lessons: level?.lessons || [],
    };

    const res = await saveLevel(value);
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
      title={isNew ? "إضافة مرحلة جديدة" : "تعديل المرحلة"}
      subtitle="المرحلة بتجمّع مجموعة دروس تحت بعض."
      onClose={onClose}
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
            {saving ? "جارٍ الحفظ…" : "حفظ المرحلة"}
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
          <Field label="عنوان المرحلة (عربي)">
            <input
              type="text"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Stage title (English)">
            <input
              type="text"
              dir="ltr"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="وصف المرحلة (عربي)">
            <textarea
              rows={3}
              value={descriptionAr}
              onChange={(e) => setDescriptionAr(e.target.value)}
              className={textareaClass}
            />
          </Field>
          <Field label="Stage description (English)">
            <textarea
              dir="ltr"
              rows={3}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className={textareaClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="الترتيب">
            <input
              type="number"
              value={order}
              onChange={(e) => setOrder(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="الحالة">
            <label className="flex items-center gap-2 p-2.5 bg-white border-2 border-[#0A0A0A] cursor-pointer">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-[#3346F0]"
              />
              <span className="text-xs font-black">
                {published ? "منشورة" : "مسودّة"}
              </span>
            </label>
          </Field>
        </div>
      </div>
    </AdminModal>
  );
};
