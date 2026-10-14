"use client";

import React from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { getRankByXp, getNextRank } from "@/lib/xpRules";
import { useContent } from "@/context/ContentContext";
import {
  Flame,
  Zap,
  Crosshair,
  Award,
  BookOpen,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function DashboardPage() {
  const { t, locale, dir } = useTranslation();
  const { user } = useAuth();
  const { totalLessons } = useContent();

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const completedLessonsCount = user?.completedLessons?.length ?? 0;
  const solvedChallengesCount = user?.solvedChallenges?.length || 0;
  const currentRank = getRankByXp(xp);
  const { nextRank, xpNeeded, progressPercent } = getNextRank(xp);

  const rankName = (r: { nameAr: string; nameEn: string }) =>
    locale === "ar" ? r.nameAr : r.nameEn;

  const allLessonsDone = completedLessonsCount >= totalLessons && totalLessons > 0;

  // 7 days of the week streak boxes
  const daysOfWeek =
    locale === "ar"
      ? ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"]
      : ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* =============================================== */}
        {/* WELCOME HERO BANNER                             */}
        {/* =============================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Welcome Card */}
          <Card
            variant="yellow"
            className="lg:col-span-8 p-6 sm:p-8 flex flex-col justify-between shadow-[8px_8px_0px_#0A0A0A]"
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="dark" size="sm">
                  {user?.role === "owner"
                    ? t("dashboard.owner_badge")
                    : t("dashboard.learner_badge")}
                </Badge>
                <span className="text-xs font-black text-[#0A0A0A]">
                  {rankName(currentRank)} ({xp} XP)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A] leading-tight">
                {t("dashboard.welcome")}،{" "}
                {user?.displayName || (locale === "ar" ? "يا بطل" : "champion")}! 👋
              </h1>

              <p className="text-sm font-bold text-[#0A0A0A]/80 mt-2 max-w-lg">
                {t("dashboard.goal_text")}
              </p>
            </div>

            {/* Rank Progress Bar */}
            <div className="mt-6 pt-4 border-t-2 border-[#0A0A0A]">
              <div className="flex justify-between items-center text-xs font-black text-[#0A0A0A] mb-1.5">
                <span>
                  {t("dashboard.rank_title")}: {rankName(currentRank)}
                </span>
                {nextRank ? (
                  <span>
                    {t("dashboard.next_rank")}: {rankName(nextRank)} (
                    {t("dashboard.remaining")} {xpNeeded} XP)
                  </span>
                ) : (
                  <span>{t("dashboard.top_rank_reached")}</span>
                )}
              </div>

              <div className="w-full bg-white h-3.5 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] overflow-hidden">
                <div
                  className="bg-[#3346F0] h-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button
                  href="/learn"
                  variant="dark"
                  size="md"
                  icon={<ArrowIcon className="w-4 h-4" />}
                  iconPosition="end"
                >
                  {t("dashboard.continue_btn")}
                </Button>
              </div>
            </div>
          </Card>

          {/* Active Streak Card */}
          <Card
            variant="white"
            className="lg:col-span-4 p-6 flex flex-col justify-between shadow-[6px_6px_0px_#0A0A0A]"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-lg text-[#0A0A0A] flex items-center gap-1.5">
                  <Flame className="w-5 h-5 text-[#FF6B00] fill-current" />
                  <span>{t("dashboard.streak_card_title")}</span>
                </h3>
                <span className="text-2xl font-black text-[#FF6B00]">
                  {streak} 🔥
                </span>
              </div>

              <p className="text-xs font-bold text-gray-600 mb-4">
                {t("dashboard.streak_tip")}
              </p>

              {/* 7 Days Grid */}
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {daysOfWeek.map((day, idx) => {
                  const isActive = idx < streak;
                  return (
                    <div key={day} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-none border-2 border-[#0A0A0A] flex items-center justify-center font-black text-xs ${
                          isActive
                            ? "bg-[#FF6B00] text-white shadow-[2px_2px_0px_#0A0A0A]"
                            : "bg-[#E8E8E8] text-gray-400"
                        }`}
                      >
                        {isActive ? "🔥" : "•"}
                      </div>
                      <span className="text-[9px] font-bold text-gray-500 mt-1 truncate max-w-[32px]">
                        {day[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200 text-[11px] font-bold text-gray-500 text-center">
              {t("dashboard.streak_reset_note")}
            </div>
          </Card>
        </div>

        {/* =============================================== */}
        {/* STATS OVERVIEW CARDS                            */}
        {/* =============================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card variant="white" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FACC15] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">{t("dashboard.stats_lessons_done")}</p>
              <p className="text-2xl font-black text-[#0A0A0A]">{completedLessonsCount}</p>
            </div>
          </Card>

          <Card variant="white" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#3346F0] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">{t("dashboard.stats_total_xp")}</p>
              <p className="text-2xl font-black text-[#0A0A0A]">{xp} XP</p>
            </div>
          </Card>

          <Card variant="white" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#FF6B00] text-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center shrink-0">
              <Crosshair className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">{t("dashboard.stats_challenges_solved")}</p>
              <p className="text-2xl font-black text-[#0A0A0A]">{solvedChallengesCount}</p>
            </div>
          </Card>

          <Card variant="white" className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#0A0A0A]" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500">{t("dashboard.stats_certificates")}</p>
              <p className="text-2xl font-black text-[#0A0A0A]">{allLessonsDone ? "1" : "0"}</p>
            </div>
          </Card>
        </div>

        {/* =============================================== */}
        {/* CONTINUE LEARNING SECTION                       */}
        {/* =============================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#0A0A0A]">
              {t("dashboard.continue_learning")}
            </h2>
            <Button
              href="/learn"
              variant="outline"
              size="sm"
              icon={<ArrowIcon className="w-4 h-4" />}
              iconPosition="end"
            >
              {t("dashboard.view_all")}
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Placeholder for next lesson - could fetch from content context */}
            <Card variant="white" className="p-5 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#FACC15] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] flex items-center justify-center shrink-0">
                <Crosshair className="w-6 h-6 text-[#0A0A0A]" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-500">{t("dashboard.next_up")}</p>
                <p className="text-lg font-black text-[#0A0A0A]">{t("dashboard.go_to_learn")}</p>
              </div>
              <Button href="/learn" variant="primary" size="sm">
                {t("dashboard.go_learn")}
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}