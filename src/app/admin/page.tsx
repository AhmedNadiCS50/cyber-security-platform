"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon } from "@/components/common/CyberIcon";
import { LevelEditor } from "@/components/admin/LevelEditor";
import { LessonEditor } from "@/components/admin/LessonEditor";
import { ChallengeEditor } from "@/components/admin/ChallengeEditor";
import type { Level, Lesson, Challenge, Question } from "@/lib/seedData";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import { fetchPlatformStats, PlatformStats } from "@/lib/firebaseHelpers";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  limit,
} from "firebase/firestore";
import { UserProfile } from "@/context/AuthContext";
import {
  ShieldAlert,
  Layers,
  HelpCircle,
  Flag,
  Users,
  BarChart3,
  Plus,
  Trash2,
  Video,
  FileText,
  Lock,
  Pencil,
  UploadCloud,
  RefreshCw,
} from "lucide-react";

type Tab = "levels" | "quizzes" | "challenges" | "users" | "stats";

const QUESTION_TYPE_LABEL: Record<Question["type"], string> = {
  mcq: "اختيار من متعدد",
  terminal: "أوامر طرفية",
  flag: "التقاط Flag",
  code: "كتابة كود",
};

const DIFFICULTY_LABEL: Record<Challenge["difficulty"], string> = {
  easy: "سهل",
  medium: "متوسط",
  hard: "صعب",
};

interface ConfirmState {
  title: string;
  message: string;
  onConfirm: () => void;
}

export default function AdminPage() {
  const { t } = useTranslation();
  const { user, isOwner } = useAuth();
  const {
    levels,
    challenges,
    loading: contentLoading,
    usingSeed,
    totalLessons,
    reload,
    publishSeed,
    saveLesson,
    deleteLevel,
    deleteLesson,
    deleteChallenge,
  } = useContent();

  const [activeTab, setActiveTab] = useState<Tab>("levels");

  // ─── Real users from Firestore ──────────────────────────────────────────────
  const [realUsers, setRealUsers] = useState<UserProfile[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  // ─── Real stats from Firestore ──────────────────────────────────────────────
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  // ─── Toasts ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(id);
  }, [toast]);

  // ─── Modals ─────────────────────────────────────────────────────────────────
  const [levelEditorOpen, setLevelEditorOpen] = useState(false);
  const [editLevel, setEditLevel] = useState<Level | undefined>(undefined);
  const [lessonEditor, setLessonEditor] = useState<{
    levelId: string;
    levelTitle: string;
    lesson?: Lesson;
    nextOrder?: number;
  } | null>(null);
  const [challengeEditor, setChallengeEditor] = useState<Challenge | undefined>(undefined);
  const [challengeEditorOpen, setChallengeEditorOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [busy, setBusy] = useState(false);

  const canLoadUsers = Boolean(isFirebaseConfigured && db);

  const loadUsers = useCallback(async () => {
    if (!canLoadUsers || !db) return;
    setUsersLoading(true);
    try {
      const snap = await getDocs(query(collection(db, "users"), limit(200)));
      const list = snap.docs.map((d) => ({ ...(d.data() as UserProfile), uid: d.id }));
      list.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setRealUsers(list);
    } catch (e) {
      console.error("load users failed:", e);
      showToast("error", "تعذر تحميل قائمة المتعلمين.");
    } finally {
      setUsersLoading(false);
      setUsersLoaded(true);
    }
  }, [canLoadUsers, showToast]);

  useEffect(() => {
    if (activeTab !== "users" || !isOwner || usersLoaded) return;
    void loadUsers();
  }, [activeTab, isOwner, usersLoaded, loadUsers]);

  useEffect(() => {
    if (activeTab !== "stats" || !isOwner || statsLoaded) return;
    fetchPlatformStats()
      .then((data) => setStats(data))
      .catch(console.error)
      .finally(() => setStatsLoaded(true));
  }, [activeTab, isOwner, statsLoaded]);

  // ─── Actions ────────────────────────────────────────────────────────────────
  const handleToggleBan = async (u: UserProfile) => {
    if (!db) return;
    try {
      await updateDoc(doc(db, "users", u.uid), { banned: !u.banned });
      setRealUsers((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, banned: !u.banned } : x))
      );
      showToast("success", u.banned ? "تم إلغاء الحظر." : "تم حظر الحساب.");
    } catch {
      showToast("error", "تعذر تحديث حالة الحساب.");
    }
  };

  const handleDeleteUser = (u: UserProfile) =>
    setConfirm({
      title: "حذف ملف المستخدم",
      message: `هتحذف بيانات ${u.displayName || u.email} نهائياً من قاعدة البيانات (حساب الدخول نفسه يفضل موجود). متأكد؟`,
      onConfirm: async () => {
        setBusy(true);
        try {
          await deleteDoc(doc(db!, "users", u.uid));
          setRealUsers((prev) => prev.filter((x) => x.uid !== u.uid));
          showToast("success", "تم حذف ملف المستخدم.");
        } catch {
          showToast("error", "تعذر حذف المستخدم.");
        } finally {
          setBusy(false);
          setConfirm(null);
        }
      },
    });

  const handlePublishSeed = async () => {
    setBusy(true);
    const res = await publishSeed();
    setBusy(false);
    if (res.ok) showToast("success", "تم نشر المحتوى الابتدائي على الموقع.");
    else showToast("error", `فشل النشر: ${res.error}`);
  };

  const handleReload = async () => {
    setBusy(true);
    await reload();
    setBusy(false);
    showToast("success", "تم تحديث المحتوى.");
  };

  const handleDeleteLevel = (level: Level) =>
    setConfirm({
      title: "حذف المرحلة",
      message: `هتحذف مرحلة «${level.titleAr}» وكل دروسها (${level.lessons.length}). متأكد؟`,
      onConfirm: async () => {
        setBusy(true);
        const res = await deleteLevel(level.id);
        setBusy(false);
        setConfirm(null);
        showToast(res.ok ? "success" : "error", res.ok ? "تم حذف المرحلة." : "تعذر الحذف.");
      },
    });

  const handleDeleteLesson = (level: Level, lesson: Lesson) =>
    setConfirm({
      title: "حذف الدرس",
      message: `هتحذف درس «${lesson.titleAr}». متأكد؟`,
      onConfirm: async () => {
        setBusy(true);
        const res = await deleteLesson(level.id, lesson.id);
        setBusy(false);
        setConfirm(null);
        showToast(res.ok ? "success" : "error", res.ok ? "تم حذف الدرس." : "تعذر الحذف.");
      },
    });

  const handleDeleteChallenge = (ch: Challenge) =>
    setConfirm({
      title: "حذف التحدي",
      message: `هتحذف تحدي «${ch.titleAr}». متأكد؟`,
      onConfirm: async () => {
        setBusy(true);
        const res = await deleteChallenge(ch.id);
        setBusy(false);
        setConfirm(null);
        showToast(res.ok ? "success" : "error", res.ok ? "تم حذف التحدي." : "تعذر الحذف.");
      },
    });

  const toggleLessonPublish = async (level: Level, lesson: Lesson) => {
    const res = await saveLesson(level.id, { ...lesson, published: !lesson.published });
    showToast(res.ok ? "success" : "error", res.ok ? "تم تحديث حالة الدرس." : "تعذر التحديث.");
  };

  const openNewLesson = (levelId: string, levelTitle: string) => {
    const lvl = levels.find((l) => l.id === levelId);
    setLessonEditor({
      levelId,
      levelTitle,
      nextOrder: (lvl?.lessons.length || 0) + 1,
    });
  };

  // ─── Owner guard ────────────────────────────────────────────────────────────
  if (!isOwner) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <Card
            variant="white"
            className="max-w-md w-full text-center p-8 shadow-[8px_8px_0px_#0A0A0A]"
          >
            <div className="w-16 h-16 bg-red-100 border-[3px] border-red-600 mx-auto flex items-center justify-center shadow-[4px_4px_0px_#DC2626] mb-4">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-black text-[#0A0A0A] mb-2">
              منطقة محمية (خاصة بالأونر)
            </h1>
            <p className="text-sm font-bold text-gray-700 mb-6">
              هذه الصفحة مخصصة لمالك المنصة فقط لإدارة المراحل والدروس والاختبارات والتحديات.
            </p>
            <div className="space-y-3">
              {!user && (
                <Button href="/login" variant="primary" size="md" className="w-full">
                  تسجيل الدخول بحساب الأونر
                </Button>
              )}
              <Button href="/" variant="outline" size="md" className="w-full">
                العودة للرئيسية
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const allLessons = levels.flatMap((lvl) => lvl.lessons.map((l) => ({ level: lvl, lesson: l })));

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b-[3px] border-[#0A0A0A]">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="blue" size="md">
                <ShieldAlert className="w-4 h-4" />
                <span>{t("admin.owner_badge")}</span>
              </Badge>
              <span className="text-xs font-bold text-gray-600">
                الحساب: {user?.email || "مالك المنصة"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A]">
              <HandDrawnUnderline>{t("admin.title")}</HandDrawnUnderline>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1">
              {levels.length} مرحلة · {totalLessons} درس · {challenges.length} تحدي
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={handleReload}
              disabled={busy}
            >
              تحديث
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditLevel(undefined);
                setLevelEditorOpen(true);
              }}
            >
              {t("admin.add_level")}
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() =>
                openNewLesson(levels[0]?.id || "level-1", levels[0]?.titleAr || "")
              }
            >
              {t("admin.add_lesson")}
            </Button>
          </div>
        </div>

        {/* Publish starter content banner */}
        {usingSeed && (
          <Card variant="yellow" className="p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <UploadCloud className="w-7 h-7 shrink-0" />
              <div>
                <h3 className="font-black text-base">فعّل لوحة التحكم بنشر المحتوى</h3>
                <p className="text-xs font-bold mt-1 max-w-2xl">
                  الموقع دلوقتي شغّال بالمحتوى الابتدائي المدمج. اضغط الزر مرة واحدة لنشر
                  المراحل والدروس والتحديات لقاعدة البيانات، وبعدها كل تعديل تعمله هنا هيظهر
                  فوراً لكل الزوار.
                </p>
              </div>
            </div>
            <Button
              variant="dark"
              size="md"
              icon={<UploadCloud className="w-4 h-4" />}
              onClick={handlePublishSeed}
              disabled={busy}
              className="shrink-0"
            >
              نشر المحتوى الابتدائي
            </Button>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 select-none">
          {[
            { id: "levels", label: t("admin.tab_levels"), icon: <Layers className="w-4 h-4" /> },
            { id: "quizzes", label: t("admin.tab_quizzes"), icon: <HelpCircle className="w-4 h-4" /> },
            { id: "challenges", label: t("admin.tab_challenges"), icon: <Flag className="w-4 h-4" /> },
            { id: "users", label: t("admin.tab_users"), icon: <Users className="w-4 h-4" /> },
            { id: "stats", label: t("admin.tab_stats"), icon: <BarChart3 className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`flex items-center gap-2 px-4 py-2.5 font-black text-sm border-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[3px_3px_0px_#FACC15] -translate-y-0.5"
                    : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {contentLoading && levels.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#3346F0] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ─── Tab: Stages & Lessons ─────────────────────────────── */}
            {activeTab === "levels" && (
              <div className="space-y-8">
                {levels.length === 0 && (
                  <p className="text-center font-bold text-gray-500 py-12">
                    لا توجد مراحل. اضغط «إضافة مرحلة جديدة» للبدء.
                  </p>
                )}
                {levels.map((lvl) => (
                  <Card key={lvl.id} variant="white" className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b-2 border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 bg-[#FACC15] border-2 border-[#0A0A0A] font-black text-sm flex items-center justify-center shadow-[2px_2px_0px_#0A0A0A]">
                          {String(lvl.order).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="font-black text-xl text-[#0A0A0A] flex items-center gap-2">
                            {lvl.titleAr}
                            {!lvl.published && (
                              <span className="text-[10px] font-black bg-gray-200 border border-gray-500 px-1.5 py-0.5">
                                مسودّة
                              </span>
                            )}
                          </h3>
                          <p className="text-xs font-bold text-gray-600">{lvl.descriptionAr}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="green" size="sm">
                          {lvl.lessons.length} درس
                        </Badge>
                        <button
                          onClick={() => {
                            setEditLevel(lvl);
                            setLevelEditorOpen(true);
                          }}
                          className="p-2 bg-white hover:bg-[#FACC15] border-2 border-[#0A0A0A] cursor-pointer"
                          title="تعديل المرحلة"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLevel(lvl)}
                          className="p-2 bg-white hover:bg-red-100 text-red-700 border-2 border-[#0A0A0A] cursor-pointer"
                          title="حذف المرحلة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openNewLesson(lvl.id, lvl.titleAr)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#3346F0] text-white border-2 border-[#0A0A0A] font-black text-xs cursor-pointer shadow-[2px_2px_0px_#0A0A0A]"
                        >
                          <Plus className="w-3.5 h-4" />
                          درس
                        </button>
                      </div>
                    </div>

                    {lvl.lessons.length === 0 ? (
                      <p className="text-sm font-bold text-gray-500 text-center py-6 bg-[#FAF6EC] border-2 border-dashed border-gray-400">
                        لا توجد دروس في هذه المرحلة بعد.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lvl.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-4 bg-[#FAF6EC] border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-black text-base text-[#0A0A0A]">
                                  {lesson.titleAr}
                                  {!lesson.published && (
                                    <span className="ms-2 text-[10px] font-black bg-gray-200 border border-gray-500 px-1.5 py-0.5 align-middle">
                                      مسودّة
                                    </span>
                                  )}
                                </h4>
                                <span className="text-xs font-black text-[#3346F0] bg-white px-2 py-0.5 border border-[#0A0A0A] shrink-0">
                                  +{lesson.xp} XP
                                </span>
                              </div>
                              <p className="text-xs font-bold text-gray-700 line-clamp-2 mb-3">
                                {lesson.descriptionAr}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-gray-300 gap-2">
                              <div className="flex items-center gap-1.5 text-xs font-bold text-[#3346F0] min-w-0">
                                {lesson.youtubeId ? (
                                  <>
                                    <Video className="w-4 h-4 shrink-0" />
                                    <span className="truncate">فيديو</span>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-4 h-4 shrink-0" />
                                    <span>درس نصي</span>
                                  </>
                                )}
                                <span className="text-gray-500">· {lesson.quiz.length} سؤال</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() =>
                                    setLessonEditor({
                                      levelId: lvl.id,
                                      levelTitle: lvl.titleAr,
                                      lesson,
                                    })
                                  }
                                  className="p-1.5 bg-white hover:bg-[#FACC15] border border-[#0A0A0A] cursor-pointer"
                                  title="تعديل الدرس"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => toggleLessonPublish(lvl, lesson)}
                                  className="px-2 py-1 text-[11px] font-black border border-[#0A0A0A] bg-white hover:bg-[#FAF6EC] cursor-pointer"
                                  title="تغيير حالة النشر"
                                >
                                  {lesson.published ? "إخفاء" : "نشر"}
                                </button>
                                <button
                                  onClick={() => handleDeleteLesson(lvl, lesson)}
                                  className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-700 cursor-pointer"
                                  title="حذف الدرس"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() =>
                        openNewLesson(lvl.id, lvl.titleAr)
                      }
                      className="mt-4 w-full py-2.5 border-2 border-dashed border-[#0A0A0A] font-black text-sm hover:bg-[#FACC15] cursor-pointer"
                    >
                      + إضافة درس لهذه المرحلة
                    </button>
                  </Card>
                ))}

                {levels.length > 0 && (
                  <button
                    onClick={() => {
                      setEditLevel(undefined);
                      setLevelEditorOpen(true);
                    }}
                    className="w-full py-3 border-[3px] border-dashed border-[#0A0A0A] font-black text-base hover:bg-[#FACC15] cursor-pointer"
                  >
                    + إضافة مرحلة جديدة
                  </button>
                )}
              </div>
            )}

            {/* Tab 2: Quizzes Overview */}
            {activeTab === "quizzes" && (
              <div className="space-y-6">
                <div className="p-4 bg-white border-[2.5px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-lg text-[#0A0A0A]">منشئ الاختبارات</h3>
                    <p className="text-xs font-bold text-gray-600">
                      كل درس له اختباره. اضغط «تعديل» لبناء الأسئلة (اختيار من متعدد، طرفية، Flag، كود).
                    </p>
                  </div>
                  <Badge variant="yellow" size="md">
                    {allLessons.reduce((n, x) => n + x.lesson.quiz.length, 0)} سؤال إجمالي
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allLessons.map(({ level, lesson }) => (
                    <Card key={lesson.id} variant="white" className="p-5">
                      <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-gray-200">
                        <div>
                          <h4 className="font-black text-base text-[#0A0A0A]">{lesson.titleAr}</h4>
                          <p className="text-[11px] font-bold text-gray-500">{level.titleAr}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black bg-[#3346F0] text-white px-2 py-0.5">
                            {lesson.quiz.length} أسئلة
                          </span>
                          <button
                            onClick={() =>
                              setLessonEditor({
                                levelId: level.id,
                                levelTitle: level.titleAr,
                                lesson,
                              })
                            }
                            className="p-1.5 bg-white hover:bg-[#FACC15] border-2 border-[#0A0A0A] cursor-pointer"
                            title="تعديل الأسئلة"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {lesson.quiz.length === 0 ? (
                          <p className="text-xs font-bold text-gray-500">لا توجد أسئلة بعد.</p>
                        ) : (
                          lesson.quiz.map((q, idx) => (
                            <div
                              key={q.id}
                              className="p-3 bg-[#FAF6EC] border border-[#0A0A0A] text-xs flex items-center gap-2"
                            >
                              <span className="w-6 h-6 bg-[#0A0A0A] text-white font-black text-[10px] flex items-center justify-center shrink-0">
                                {idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-black truncate">{q.questionAr || "(بدون نص)"}</p>
                                <span className="text-[10px] font-bold text-gray-500">
                                  {QUESTION_TYPE_LABEL[q.type]}
                                </span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Challenges */}
            {activeTab === "challenges" && (
              <div className="space-y-6">
                <div className="p-4 bg-white border-[2.5px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-black text-lg text-[#0A0A0A]">
                      التحديات ({challenges.length})
                    </h3>
                    <p className="text-xs font-bold text-gray-600">
                      التحديات المنشورة بتظهر للمتعلمين في صفحة التحديات.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      setChallengeEditor(undefined);
                      setChallengeEditorOpen(true);
                    }}
                  >
                    {t("admin.add_challenge")}
                  </Button>
                </div>

                {challenges.length === 0 ? (
                  <p className="text-center font-black text-gray-500 py-10">
                    لا توجد تحديات بعد.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {challenges.map((ch) => (
                      <div
                        key={ch.id}
                        className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-black bg-[#FACC15] px-2 py-0.5 border border-[#0A0A0A]">
                              {DIFFICULTY_LABEL[ch.difficulty]}
                            </span>
                            <span className="text-xs font-bold text-[#3346F0]">+{ch.xp} XP</span>
                          </div>
                          <h4 className="font-black text-base text-[#0A0A0A] mb-1 flex items-center gap-2">
                            {ch.titleAr}
                            {!ch.published && (
                              <span className="text-[10px] font-black bg-gray-200 border border-gray-500 px-1.5 py-0.5">
                                مسودّة
                              </span>
                            )}
                          </h4>
                          <p className="text-[11px] font-bold text-gray-600 bg-gray-100 p-1.5 border border-gray-300">
                            {QUESTION_TYPE_LABEL[ch.question.type]}
                          </p>
                          <p className="mt-2 text-xs font-bold text-gray-700 line-clamp-2">
                            {ch.question.questionAr}
                          </p>
                        </div>

                        <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setChallengeEditor(ch);
                              setChallengeEditorOpen(true);
                            }}
                            className="p-1.5 bg-white hover:bg-[#FACC15] border-2 border-[#0A0A0A] cursor-pointer"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteChallenge(ch)}
                            className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border-2 border-red-700 cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Users */}
            {activeTab === "users" && (
              <Card variant="white" className="p-6">
                <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                  <h3 className="font-black text-xl text-[#0A0A0A]">المتعلمون المسجلون</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {realUsers.length} مستخدم
                    </Badge>
                    <button
                      onClick={() => void loadUsers()}
                      className="p-2 bg-white hover:bg-[#FACC15] border-2 border-[#0A0A0A] cursor-pointer"
                      title="تحديث"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {usersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#3346F0] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : !isFirebaseConfigured ? (
                  <p className="text-sm font-bold text-orange-600 text-center py-8">
                    ⚠️ Firebase غير مفعّل.
                  </p>
                ) : realUsers.length === 0 ? (
                  <p className="text-sm font-bold text-gray-600 text-center py-8">
                    لا يوجد مستخدمون بعد. سجّل دخول بحساب الأونر (Google) مرة واحدة لإنشاء ملفك.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-start text-sm">
                      <thead>
                        <tr className="border-b-2 border-[#0A0A0A] bg-[#FAF6EC] font-black text-xs uppercase text-[#0A0A0A]">
                          <th className="p-3 text-start">الاسم</th>
                          <th className="p-3 text-start">البريد</th>
                          <th className="p-3 text-start">الرتبة</th>
                          <th className="p-3 text-start">الـ XP</th>
                          <th className="p-3 text-start">الستريك</th>
                          <th className="p-3 text-start">الدروس</th>
                          <th className="p-3 text-start">الحالة</th>
                          <th className="p-3 text-start">إجراءات</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 font-bold">
                        {realUsers.map((u) => (
                          <tr key={u.uid} className={u.banned ? "bg-red-50" : ""}>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-[#FACC15] border border-[#0A0A0A] flex items-center justify-center shrink-0">
                                  <CyberIcon name={u.avatar || "shield"} size={16} />
                                </div>
                                <span className="truncate max-w-[120px]">
                                  {u.displayName || "—"}
                                </span>
                                {u.role === "owner" && (
                                  <span className="text-[10px] bg-[#3346F0] text-white px-1 font-black">
                                    OWNER
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-gray-600 text-xs">{u.email}</td>
                            <td className="p-3 text-[#3346F0] text-xs">{u.rank}</td>
                            <td className="p-3 font-black">
                              {(u.xp || 0).toLocaleString("ar")} XP
                            </td>
                            <td className="p-3">{u.streak || 0} 🔥</td>
                            <td className="p-3">{u.completedLessons?.length || 0}</td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleBan(u)}
                                className={`px-2 py-0.5 text-xs font-black border cursor-pointer transition-colors ${
                                  u.banned
                                    ? "bg-red-100 text-red-800 border-red-700 hover:bg-red-200"
                                    : "bg-green-100 text-green-800 border-green-600 hover:bg-red-100 hover:text-red-800 hover:border-red-600"
                                }`}
                              >
                                {u.banned ? "⛔ محظور" : "✅ نشط"}
                              </button>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleDeleteUser(u)}
                                className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 border border-red-700 cursor-pointer"
                                title="حذف الملف"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            )}

            {/* Tab 5: Stats */}
            {activeTab === "stats" && (
              <div className="space-y-6">
                {!isFirebaseConfigured && (
                  <div className="p-4 bg-orange-50 border-2 border-orange-400 font-bold text-orange-700 text-sm">
                    ⚠️ Firebase غير مفعّل.
                  </div>
                )}
                {!statsLoaded ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="w-8 h-8 border-4 border-[#3346F0] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card variant="yellow" className="p-5">
                      <p className="font-black text-xs uppercase">إجمالي المتعلمين</p>
                      <p className="font-black text-3xl mt-2">
                        {stats?.totalUsers ?? 0}
                      </p>
                    </Card>
                    <Card variant="white" className="p-5">
                      <p className="font-black text-xs uppercase text-gray-600">نشِط اليوم</p>
                      <p className="font-black text-3xl mt-2">
                        {stats?.activeToday ?? 0}
                      </p>
                    </Card>
                    <Card variant="white" className="p-5">
                      <p className="font-black text-xs uppercase text-gray-600">
                        دروس مكتملة
                      </p>
                      <p className="font-black text-3xl mt-2">
                        {stats?.lessonsCompleted ?? 0}
                      </p>
                    </Card>
                    <Card variant="white" className="p-5">
                      <p className="font-black text-xs uppercase text-gray-600">
                        تحديات محلولة
                      </p>
                      <p className="font-black text-3xl mt-2">
                        {stats?.challengesSolved ?? 0}
                      </p>
                    </Card>
                  </div>
                )}

                <Card variant="white" className="p-5">
                  <h3 className="font-black text-lg mb-3">ملخص المحتوى</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="p-3 bg-[#FAF6EC] border-2 border-[#0A0A0A]">
                      <p className="font-black text-2xl">{levels.length}</p>
                      <p className="text-xs font-bold text-gray-600">مراحل</p>
                    </div>
                    <div className="p-3 bg-[#FAF6EC] border-2 border-[#0A0A0A]">
                      <p className="font-black text-2xl">{totalLessons}</p>
                      <p className="text-xs font-bold text-gray-600">دروس</p>
                    </div>
                    <div className="p-3 bg-[#FAF6EC] border-2 border-[#0A0A0A]">
                      <p className="font-black text-2xl">
                        {allLessons.reduce((n, x) => n + x.lesson.quiz.length, 0)}
                      </p>
                      <p className="text-xs font-bold text-gray-600">أسئلة</p>
                    </div>
                    <div className="p-3 bg-[#FAF6EC] border-2 border-[#0A0A0A]">
                      <p className="font-black text-2xl">{challenges.length}</p>
                      <p className="text-xs font-bold text-gray-600">تحديات</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {/* ─── Editors ─────────────────────────────────────────────────────────── */}
      {levelEditorOpen && (
        <LevelEditor
          level={editLevel}
          nextOrder={levels.length + 1}
          onClose={() => setLevelEditorOpen(false)}
          onSaved={() => showToast("success", "تم حفظ المرحلة.")}
        />
      )}

      {lessonEditor && (
        <LessonEditor
          levelId={lessonEditor.levelId}
          levelTitle={lessonEditor.levelTitle}
          lesson={lessonEditor.lesson}
          nextOrder={lessonEditor.nextOrder}
          onClose={() => setLessonEditor(null)}
          onSaved={() => showToast("success", "تم حفظ الدرس.")}
        />
      )}

      {challengeEditorOpen && (
        <ChallengeEditor
          challenge={challengeEditor}
          onClose={() => setChallengeEditorOpen(false)}
          onSaved={() => showToast("success", "تم حفظ التحدي.")}
        />
      )}

      {/* ─── Confirm dialog ──────────────────────────────────────────────────── */}
      {confirm && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <Card variant="white" hoverEffect={false} className="max-w-md w-full p-6 shadow-[10px_10px_0px_#0A0A0A]">
            <h3 className="font-black text-xl mb-2">{confirm.title}</h3>
            <p className="text-sm font-bold text-gray-700 mb-6">{confirm.message}</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                disabled={busy}
                className="px-4 py-2 bg-white border-2 border-[#0A0A0A] font-black text-sm hover:bg-[#FAF6EC] cursor-pointer"
              >
                إلغاء
              </button>
              <button
                onClick={confirm.onConfirm}
                disabled={busy}
                className="px-4 py-2 bg-red-600 text-white border-2 border-[#0A0A0A] font-black text-sm shadow-[3px_3px_0px_#0A0A0A] hover:-translate-y-0.5 cursor-pointer disabled:opacity-60"
              >
                {busy ? "جارٍ…" : "تأكيد الحذف"}
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] px-5 py-3 border-[3px] border-[#0A0A0A] font-black text-sm shadow-[5px_5px_0px_#0A0A0A] ${
            toast.type === "success" ? "bg-[#22C55E] text-white" : "bg-red-600 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
}
