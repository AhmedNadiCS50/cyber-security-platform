"use client";

/**
 * ContentContext.tsx
 *
 * Single source of truth for the platform's learning content (stages, lessons,
 * quizzes and daily challenges).
 *
 * Content lives in Firestore so the owner can publish it from the Admin panel
 * and every visitor sees the update. Until the owner publishes something the
 * context falls back to the small built-in starter content (`SEED_*`), so the
 * site always works out of the box.
 *
 * Firestore layout:
 *   levels/{levelId}                        → stage meta (no lessons)
 *   levels/{levelId}/lessons/{lessonId}     → lesson + quiz
 *   challenges/{challengeId}                → daily challenge
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
  SEED_CHALLENGES,
  SEED_LEVELS,
  type Challenge,
  type Level,
  type Lesson,
} from "@/lib/seedData";

export interface SaveResult {
  ok: boolean;
  error?: string;
}

interface ContentContextType {
  levels: Level[];
  challenges: Challenge[];
  loading: boolean;
  /** True while the site is showing the built-in starter content. */
  usingSeed: boolean;
  /** True after the admin has published/saved content at least once. */
  hasPublished: boolean;
  error: string | null;
  totalLessons: number;
  reload: () => Promise<void>;
  /** Publish the built-in starter content to Firestore (one click, first run). */
  publishSeed: () => Promise<SaveResult>;
  saveLevel: (level: Level) => Promise<SaveResult>;
  deleteLevel: (levelId: string) => Promise<SaveResult>;
  saveLesson: (levelId: string, lesson: Lesson) => Promise<SaveResult>;
  deleteLesson: (levelId: string, lessonId: string) => Promise<SaveResult>;
  saveChallenge: (challenge: Challenge) => Promise<SaveResult>;
  deleteChallenge: (challengeId: string) => Promise<SaveResult>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Firestore rejects `undefined` values, so strip them recursively. */
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === undefined) continue;
      out[k] = stripUndefined(v);
    }
    return out as T;
  }
  return value;
}

function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function sortLevels(levels: Level[]): Level[] {
  return [...levels].sort((a, b) => (a.order || 0) - (b.order || 0));
}

function upsert<T extends { id: string }>(list: T[], item: T): T[] {
  const idx = list.findIndex((x) => x.id === item.id);
  if (idx === -1) return [...list, item];
  const next = [...list];
  next[idx] = item;
  return next;
}

function errText(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [levels, setLevels] = useState<Level[]>(SEED_LEVELS);
  const [challenges, setChallenges] = useState<Challenge[]>(SEED_CHALLENGES);
  const [loading, setLoading] = useState<boolean>(true);
  const [usingSeed, setUsingSeed] = useState<boolean>(true);
  const [hasPublished, setHasPublished] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("content_published") === "true";
    }
    return false;
  });
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isFirebaseConfigured || !db) {
      setLevels(SEED_LEVELS);
      setChallenges(SEED_CHALLENGES);
      setUsingSeed(true);
      setLoading(false);
      return;
    }
    const database = db;
    try {
      const levelSnap = await getDocs(collection(database, "levels"));
      let remoteLevels: Level[] = [];

      if (!levelSnap.empty) {
        remoteLevels = await Promise.all(
          levelSnap.docs.map(async (levelDoc) => {
            const data = levelDoc.data();
            const lessonsSnap = await getDocs(
              collection(database, "levels", levelDoc.id, "lessons")
            );
            const lessons = sortLessons(
              lessonsSnap.docs.map((d) => d.data() as Lesson)
            );
            return {
              id: levelDoc.id,
              order: typeof data.order === "number" ? data.order : 0,
              titleAr: data.titleAr ?? "",
              titleEn: data.titleEn ?? data.titleAr ?? "",
              descriptionAr: data.descriptionAr ?? "",
              descriptionEn: data.descriptionEn ?? data.descriptionAr ?? "",
              published: data.published !== false,
              lessons,
            } as Level;
          })
        );
        remoteLevels = sortLevels(remoteLevels);
      }

      const challengeSnap = await getDocs(collection(database, "challenges"));
      const remoteChallenges = challengeSnap.empty
        ? []
        : challengeSnap.docs.map(
            (d) => ({ ...(d.data() as Challenge), id: d.id })
          );

      if (remoteLevels.length > 0) {
        setLevels(remoteLevels);
        setUsingSeed(false);
      } else if (hasPublished) {
        // Published before but now empty → show empty, don't re-seed
        setLevels([]);
        setUsingSeed(false);
      } else {
        // Never published → safe to show seed
        setLevels(SEED_LEVELS);
        setUsingSeed(true);
      }
      setChallenges(
        remoteChallenges.length > 0
          ? remoteChallenges
          : hasPublished
          ? []
          : SEED_CHALLENGES
      );
      setError(null);
    } catch (e) {
      console.error("Content load failed:", e);
      if (hasPublished) {
        setLevels([]);
        setChallenges([]);
        setUsingSeed(false);
      } else {
        setLevels(SEED_LEVELS);
        setChallenges(SEED_CHALLENGES);
        setUsingSeed(true);
      }
      setError(errText(e));
    } finally {
      setLoading(false);
    }
  }, [hasPublished]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // ─── Mutations ──────────────────────────────────────────────────────────────

  const markPublished = () => {
    if (!hasPublished) {
      setHasPublished(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("content_published", "true");
      }
    }
  };

  const saveLevel = useCallback(async (level: Level): Promise<SaveResult> => {
    if (!db) return { ok: false, error: "firebase_unavailable" };
    try {
      const meta = {
        id: level.id,
        order: level.order,
        titleAr: level.titleAr,
        titleEn: level.titleEn,
        descriptionAr: level.descriptionAr,
        descriptionEn: level.descriptionEn,
        published: level.published,
      };
      await setDoc(doc(db, "levels", level.id), stripUndefined(meta), {
        merge: true,
      });
      setLevels((prev) => {
        const exists = prev.some((l) => l.id === level.id);
        const next = exists
          ? prev.map((l) =>
              l.id === level.id ? { ...l, ...meta, lessons: l.lessons } : l
            )
          : [...prev, { ...level, lessons: level.lessons || [] }];
        return sortLevels(next);
      });
      setUsingSeed(false);
      markPublished();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }, [hasPublished]);

  const deleteLevel = useCallback(async (levelId: string): Promise<SaveResult> => {
    if (!db) return { ok: false, error: "firebase_unavailable" };
    try {
      const lessonsSnap = await getDocs(
        collection(db, "levels", levelId, "lessons")
      );
      const batch = writeBatch(db);
      lessonsSnap.forEach((d) => batch.delete(d.ref));
      batch.delete(doc(db, "levels", levelId));
      await batch.commit();
      setLevels((prev) => prev.filter((l) => l.id !== levelId));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }, []);

  const saveLesson = useCallback(
    async (levelId: string, lesson: Lesson): Promise<SaveResult> => {
      if (!db) return { ok: false, error: "firebase_unavailable" };
      const value = { ...lesson, levelId };
      try {
        await setDoc(
          doc(db, "levels", levelId, "lessons", lesson.id),
          stripUndefined(value),
          { merge: true }
        );
        setLevels((prev) =>
          prev.map((l) =>
            l.id === levelId
              ? { ...l, lessons: sortLessons(upsert(l.lessons, value)) }
              : l
          )
        );
        setUsingSeed(false);
        markPublished();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    },
    [hasPublished]
  );

  const deleteLesson = useCallback(
    async (levelId: string, lessonId: string): Promise<SaveResult> => {
      if (!db) return { ok: false, error: "firebase_unavailable" };
      try {
        await deleteDoc(doc(db, "levels", levelId, "lessons", lessonId));
        setLevels((prev) =>
          prev.map((l) =>
            l.id === levelId
              ? { ...l, lessons: l.lessons.filter((x) => x.id !== lessonId) }
              : l
          )
        );
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    },
    []
  );

  const saveChallenge = useCallback(
    async (challenge: Challenge): Promise<SaveResult> => {
      if (!db) return { ok: false, error: "firebase_unavailable" };
      try {
        await setDoc(
          doc(db, "challenges", challenge.id),
          stripUndefined({ ...challenge, id: challenge.id }),
          { merge: true }
        );
        setChallenges((prev) =>
          prev.some((c) => c.id === challenge.id)
            ? prev.map((c) => (c.id === challenge.id ? challenge : c))
            : [...prev, challenge]
        );
        setUsingSeed(false);
        markPublished();
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    },
    [hasPublished]
  );

  const deleteChallenge = useCallback(
    async (challengeId: string): Promise<SaveResult> => {
      if (!db) return { ok: false, error: "firebase_unavailable" };
      try {
        await deleteDoc(doc(db, "challenges", challengeId));
        setChallenges((prev) => prev.filter((c) => c.id !== challengeId));
        return { ok: true };
      } catch (e) {
        return { ok: false, error: errText(e) };
      }
    },
    []
  );

  const publishSeed = useCallback(async (): Promise<SaveResult> => {
    if (!db) return { ok: false, error: "firebase_unavailable" };
    const database = db;
    try {
      let batch = writeBatch(database);
      let count = 0;
      const flush = async (force = false) => {
        if ((force && count > 0) || count >= 400) {
          await batch.commit();
          batch = writeBatch(database);
          count = 0;
        }
      };

      for (const lvl of SEED_LEVELS) {
        const { lessons, ...meta } = lvl;
        batch.set(doc(database, "levels", lvl.id), stripUndefined({ ...meta, id: lvl.id }));
        count++;
        await flush();
        for (const lesson of lessons) {
          batch.set(
            doc(database, "levels", lvl.id, "lessons", lesson.id),
            stripUndefined(lesson)
          );
          count++;
          await flush();
        }
      }
      for (const ch of SEED_CHALLENGES) {
        batch.set(doc(database, "challenges", ch.id), stripUndefined({ ...ch, id: ch.id }));
        count++;
        await flush();
      }
      await flush(true);

      if (!hasPublished) {
        setHasPublished(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("content_published", "true");
        }
      }
      await reload();
      return { ok: true };
    } catch (e) {
      return { ok: false, error: errText(e) };
    }
  }, [reload, hasPublished]);

  const totalLessons = useMemo(
    () => levels.reduce((sum, lvl) => sum + (lvl.lessons?.length || 0), 0),
    [levels]
  );

  const value = useMemo<ContentContextType>(
    () => ({
      levels,
      challenges,
      loading,
      usingSeed,
      hasPublished,
      error,
      totalLessons,
      reload,
      publishSeed,
      saveLevel,
      deleteLevel,
      saveLesson,
      deleteLesson,
      saveChallenge,
      deleteChallenge,
    }),
    [
      levels,
      challenges,
      loading,
      usingSeed,
      hasPublished,
      error,
      totalLessons,
      reload,
      publishSeed,
      saveLevel,
      deleteLevel,
      saveLesson,
      deleteLesson,
      saveChallenge,
      deleteChallenge,
    ]
  );

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within a ContentProvider");
  }
  return context;
};
