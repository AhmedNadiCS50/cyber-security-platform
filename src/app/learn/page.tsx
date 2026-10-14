"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { CyberIcon } from "@/components/common/CyberIcon";
import { type Lesson } from "@/lib/seedData";
import {
  Lock,
  Check,
  Play,
  Trophy,
  Star,
  BookOpen,
} from "lucide-react";

export default function LearnPathPage() {
  const { t, locale, dir } = useTranslation();
  const { user } = useAuth();
  const router = useRouter();

  const { levels } = useContent();
  const [activeLevelId, setActiveLevelId] = useState<string>("level-1");
  const [lockedNotice, setLockedNotice] = useState<string | null>(null);

  // If user signed up but hasn't done onboarding, redirect to /onboarding
  useEffect(() => {
    if (user && !user.onboardingDone) {
      router.push("/onboarding");
    }
  }, [user, router]);

  // Show sign-in prompt for guests
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card variant="white" className="max-w-md w-full p-8 text-center shadow-[8px_8px_0px_#0A0A0A]">
            <div className="w-16 h-16 bg-[#FACC15] border-4 border-[#0A0A0A] mx-auto flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A] mb-6">
              <Lock className="w-8 h-8 text-[#0A0A0A]" />
            </div>
            <h1 className="text-2xl font-black text-[#0A0A0A] mb-3">
              {locale === "ar" ? "المسار التعليمي محمي" : "Learning Path Protected"}
            </h1>
            <p className="font-bold text-gray-700 mb-6">
              {locale === "ar"
                ? "سجل دخول أو أنشئ حساب مجاني لتصفح المسار التعليمي وتتبع تقدمك."
                : "Sign in or create a free account to access the learning path and track your progress."}
            </p>
            <div className="flex flex-col gap-3">
              <Button href="/login" variant="primary" size="lg">
                {locale === "ar" ? "تسجيل الدخول" : "Sign In"}
              </Button>
              <Button href="/signup" variant="outline" size="lg">
                {locale === "ar" ? "إنشاء حساب مجاني" : "Create Free Account"}
              </Button>
            </div>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const activeLevel = levels.find((l) => l.id === activeLevelId) || levels[0];
  const stageIcons = ["shield", "network", "terminal", "bug", "key"];

  if (!activeLevel) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center font-black text-gray-600">
          {locale === "ar"
            ? "لا يوجد محتوى منشور بعد."
            : "No published content yet."}
        </main>
        <Footer />
      </div>
    );
  }

  const activeIcon = stageIcons[(activeLevel.order - 1) % stageIcons.length];

  // Completed lessons from user profile or default sample
  const completedLessonIds = user?.completedLessons || [];

  const totalLessonsInLevel = activeLevel.lessons.length;
  const completedInLevel = activeLevel.lessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;

  const levelProgressPercent = Math.round(
    (completedInLevel / (totalLessonsInLevel || 1)) * 100
  );

  const handleLessonClick = (lesson: Lesson, isLocked: boolean) => {
    if (isLocked) {
      setLockedNotice(t("learn.locked_alert"));
      setTimeout(() => setLockedNotice(null), 3500);
      return;
    }
    router.push(`/learn/${activeLevel.id}/${lesson.id}`);
  };

  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#FACC15", "#3346F0", "#FF6B00", "#0A0A0A"],
    });
  };

  // Determine lesson state: completed, active, or locked
  const getLessonStatus = (lesson: Lesson, index: number) => {
    const isCompleted = completedLessonIds.includes(lesson.id);
    if (isCompleted) return "completed";

    // Active if first lesson or if previous lesson in this level is completed
    const prevLesson = activeLevel.lessons[index - 1];
    if (index === 0 || (prevLesson && completedLessonIds.includes(prevLesson.id))) {
      return "active";
    }

    return "locked";
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      {/* =============================================== */}
      {/* STICKY COURSE HEADER                            */}
      {/* =============================================== */}
      <div className="sticky top-20 z-40 bg-white border-b-[3px] border-[#0A0A0A] shadow-[0_4px_0px_#0A0A0A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#FACC15] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center font-black text-sm">
              <CyberIcon name={activeIcon} size={24} />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase text-[#3346F0] tracking-wider block">
                {locale === "ar" ? "المرحلة الحالية" : "Current Stage"}
              </span>
              <h2 className="font-black text-base sm:text-lg text-[#0A0A0A] truncate max-w-xs sm:max-w-md">
                {locale === "ar" ? activeLevel.titleAr : activeLevel.titleEn}
              </h2>
            </div>
          </div>

          {/* Circular Progress & Counter */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex flex-col items-end">
              <span className="font-black text-sm text-[#0A0A0A]">
                {completedInLevel} / {totalLessonsInLevel}
              </span>
              <span className="text-[10px] font-bold text-gray-500">
                {t("learn.course_progress")}
              </span>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="w-11 h-11 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-200"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#FACC15]"
                  strokeDasharray={`${levelProgressPercent}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-black text-[11px] text-[#0A0A0A]">
                {levelProgressPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Locked Lesson Alert Banner */}
      {lockedNotice && (
        <div className="bg-[#FF6B00] text-white font-extrabold text-sm py-2 px-4 text-center border-b-2 border-[#0A0A0A] animate-bounce">
          {lockedNotice}
        </div>
      )}

      {/* =============================================== */}
      {/* MAIN ROADMAP CONTAINER                          */}
      {/* =============================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================== */}
          {/* LEFT: COURSES SIDEBAR (DESKTOP)             */}
          {/* =========================================== */}
          <div className="lg:col-span-4 space-y-3 order-2 lg:order-1">
            <div className="p-3 bg-white border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] mb-4">
              <h3 className="font-black text-sm uppercase tracking-wider text-[#0A0A0A] flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#3346F0]" />
                <span>{t("learn.levels_sidebar")}</span>
              </h3>
            </div>

            <div className="space-y-3">
              {levels.map((lvl) => {
                const isActive = lvl.id === activeLevelId;
                const totalInLvl = lvl.lessons.length;
                const doneInLvl = lvl.lessons.filter((l) =>
                  completedLessonIds.includes(l.id)
                ).length;
                const isAllDone = doneInLvl === totalInLvl && totalInLvl > 0;

                return (
                  <button
                    key={lvl.id}
                    onClick={() => setActiveLevelId(lvl.id)}
                    className={`w-full text-start p-4 border-2 transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#FACC15] border-[#0A0A0A] shadow-[5px_5px_0px_#0A0A0A] -translate-x-1"
                        : "bg-white border-[#0A0A0A] hover:bg-[#FAF6EC] shadow-[2px_2px_0px_#0A0A0A]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-black text-xs px-2 py-0.5 bg-[#0A0A0A] text-white">
                        0{lvl.order}
                      </span>
                      {isAllDone && (
                        <span className="text-xs font-black text-green-700 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> مكتمل
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-sm text-[#0A0A0A] line-clamp-1">
                      {locale === "ar" ? lvl.titleAr : lvl.titleEn}
                    </h4>

                    {/* Mini progress bar */}
                    <div className="mt-2.5 w-full bg-gray-200 h-2 border border-[#0A0A0A]">
                      <div
                        className="bg-[#3346F0] h-full transition-all"
                        style={{
                          width: `${Math.round((doneInLvl / (totalInLvl || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-1 text-[10px] font-bold text-gray-700">
                      <span>{doneInLvl} / {totalInLvl} دروس</span>
                      <span>{Math.round((doneInLvl / (totalInLvl || 1)) * 100)}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================== */}
          {/* RIGHT: ZIGZAG ROADMAP CANVAS (DUOLINGO-STYLE) */}
          {/* =========================================== */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <Card
              variant="white"
              className="p-6 sm:p-12 shadow-[8px_8px_0px_#0A0A0A] relative overflow-hidden"
            >
              {/* Stage Description Banner */}
              <div className="text-center max-w-md mx-auto mb-12 pb-6 border-b-2 border-gray-200">
                <span className="inline-block px-3 py-1 bg-[#3346F0] text-white font-black text-xs uppercase mb-2">
                  المرحلة {activeLevel.order} من {levels.length}
                </span>
                <h3 className="text-2xl font-black text-[#0A0A0A]">
                  {locale === "ar" ? activeLevel.titleAr : activeLevel.titleEn}
                </h3>
                <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2">
                  {locale === "ar" ? activeLevel.descriptionAr : activeLevel.descriptionEn}
                </p>
              </div>

              {/* Zigzag Nodes Pathway */}
              <div className="relative py-8 flex flex-col items-center">
                {activeLevel.lessons.map((lesson, index) => {
                  const status = getLessonStatus(lesson, index);
                  const isLocked = status === "locked";
                  const isActive = status === "active";
                  const isCompleted = status === "completed";

                  // Zigzag alternating horizontal offsets:
                  // 0: center (0px), 1: right (+80px), 2: left (-80px), 3: right, etc.
                  const offsets = [
                    "sm:translate-x-0",
                    dir === "rtl" ? "sm:-translate-x-20" : "sm:translate-x-20",
                    dir === "rtl" ? "sm:translate-x-20" : "sm:-translate-x-20",
                    dir === "rtl" ? "sm:-translate-x-24" : "sm:translate-x-24",
                  ];
                  const offsetClass = offsets[index % offsets.length];

                  return (
                    <div
                      key={lesson.id}
                      className={`relative flex flex-col items-center my-6 group transition-transform ${offsetClass}`}
                    >
                      {/* Vertical dotted connecting line to next lesson */}
                      {index < activeLevel.lessons.length - 1 && (
                        <div className="absolute top-20 w-0.5 h-16 border-l-[3px] border-dashed border-[#0A0A0A] z-0 pointer-events-none" />
                      )}

                      {/* Main Node Circle Button */}
                      <button
                        onClick={() => handleLessonClick(lesson, isLocked)}
                        className={`relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-[3.5px] border-[#0A0A0A] flex flex-col items-center justify-center transition-all cursor-pointer select-none ${
                          isCompleted
                            ? "bg-[#0A0A0A] text-white shadow-[4px_4px_0px_#FACC15] hover:scale-105"
                            : isActive
                            ? "bg-[#FACC15] text-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] animate-pulse hover:scale-105"
                            : "bg-[#E8E8E8] text-gray-500 shadow-[3px_3px_0px_#0A0A0A] opacity-75 cursor-not-allowed"
                        }`}
                      >
                        {isCompleted && (
                          <div className="flex flex-col items-center">
                            <Check className="w-8 h-8 stroke-[3.5] text-[#FACC15]" />
                            <div className="flex gap-0.5 mt-0.5">
                              <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
                              <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
                              <Star className="w-2.5 h-2.5 fill-[#FACC15] text-[#FACC15]" />
                            </div>
                          </div>
                        )}

                        {isActive && (
                          <div className="flex flex-col items-center">
                            <Play className="w-8 h-8 fill-current text-[#0A0A0A]" />
                            <span className="text-[10px] font-black uppercase mt-0.5 bg-[#0A0A0A] text-white px-1.5 py-0.2">
                              ابدأ
                            </span>
                          </div>
                        )}

                        {isLocked && (
                          <div className="flex flex-col items-center">
                            <Lock className="w-7 h-7 text-gray-500" />
                          </div>
                        )}
                      </button>

                      {/* Lesson Title & Status Badge Below Circle */}
                      <div className="mt-3 text-center max-w-[160px] sm:max-w-[200px]">
                        <h5 className="font-black text-xs sm:text-sm text-[#0A0A0A] line-clamp-2 leading-tight">
                          {locale === "ar" ? lesson.titleAr : lesson.titleEn}
                        </h5>

                        <div className="mt-1">
                          {isCompleted && (
                            <Badge variant="dark" size="sm">
                              {t("learn.status_completed")}
                            </Badge>
                          )}
                          {isActive && (
                            <Badge variant="yellow" size="sm">
                              {t("learn.status_active")}
                            </Badge>
                          )}
                          {isLocked && (
                            <Badge variant="cream" size="sm">
                              🔒 {t("learn.status_locked")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Course Completion Crown Node */}
                <div className="mt-10 flex flex-col items-center">
                  <button
                    onClick={() => {
                      triggerCelebration();
                      alert("مبروك! لقد أتممت هذا الكورس بنجاح وتم فتح الكورس التالي 🏆");
                    }}
                    className="w-24 h-24 bg-[#FF6B00] text-white border-[3.5px] border-[#0A0A0A] rounded-full shadow-[6px_6px_0px_#0A0A0A] flex flex-col items-center justify-center hover:scale-105 transition-all cursor-pointer"
                  >
                    <Trophy className="w-10 h-10 fill-current text-white" />
                  </button>
                  <span className="mt-2 font-black text-xs sm:text-sm text-[#0A0A0A]">
                    كأس إتمام الكورس 👑
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
