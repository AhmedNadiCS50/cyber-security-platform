"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon } from "@/components/common/CyberIcon";
import {
  fetchLeaderboard,
  LeaderboardEntry,
} from "@/lib/firebaseHelpers";
import { Trophy, Flame, Loader2, Award } from "lucide-react";
import { Button } from "@/components/common/Button";

export default function LeaderboardPage() {
  const { t, locale } = useTranslation();
  const { user, isFirebaseActive } = useAuth();
  const [activeTab, setActiveTab] = useState<"week" | "month" | "all">("week");
  const [players, setPlayers] = useState<LeaderboardEntry[]>([]);
  const [loadedTab, setLoadedTab] = useState<"week" | "month" | "all" | null>(null);

  // Map tab → Firestore field
  const fieldMap: Record<"week" | "month" | "all", "weeklyXp" | "monthlyXp" | "xp"> = {
    week: "weeklyXp",
    month: "monthlyXp",
    all: "xp",
  };

  // Show sign-in prompt for guests (must be before any user-dependent code)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <Card variant="white" className="max-w-md w-full p-8 text-center shadow-[8px_8px_0px_#0A0A0A]">
            <div className="w-16 h-16 bg-[#FACC15] border-4 border-[#0A0A0A] mx-auto flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A] mb-6">
              <Trophy className="w-8 h-8 text-[#0A0A0A]" />
            </div>
            <h1 className="text-2xl font-black text-[#0A0A0A] mb-3">
              {locale === "ar" ? "لوحة المتصدرين محمية" : "Leaderboard Protected"}
            </h1>
            <p className="font-bold text-gray-700 mb-6">
              {locale === "ar"
                ? "سجل دخول لترتيبك بين المتعلمين ورؤية لوحة المتصدرين."
                : "Sign in to see your rank among learners and view the leaderboard."}
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

  useEffect(() => {
    let cancelled = false;

    fetchLeaderboard(fieldMap[activeTab], 20)
      .then((data) => {
        if (cancelled) return;
        setPlayers(data);
        setLoadedTab(activeTab);
      })
      .catch(() => {
        if (!cancelled) setLoadedTab(activeTab);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user]);

  // Loading until the data for the active tab has arrived.
  const loading = loadedTab !== activeTab;

  // Sort descending by the selected field
  const sorted = [...players].sort((a, b) => {
    const fa = fieldMap[activeTab];
    return (b[fa] as number) - (a[fa] as number);
  });

  const top1 = sorted[0];
  const top2 = sorted[1];
  const top3 = sorted[2];
  const restPlayers = sorted.slice(3);

  const currentUserRankIndex = sorted.findIndex((p) => p.id === user.uid) + 1;

  const getXpForTab = (p: LeaderboardEntry) => {
    if (activeTab === "week") return p.weeklyXp;
    if (activeTab === "month") return p.monthlyXp;
    return p.xp;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <Badge variant="yellow" size="md" className="mb-2">
            <Trophy className="w-4 h-4 fill-current text-[#0A0A0A]" />
            <span>{t("leaderboard.subtitle")}</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>{t("leaderboard.title")}</HandDrawnUnderline>
          </h1>
          {!isFirebaseActive && (
            <p className="text-xs font-bold text-orange-600 mt-2 border border-orange-400 bg-orange-50 px-3 py-1 inline-block">
              {t("leaderboard.connect_firebase")}
            </p>
          )}
        </div>

        {/* Period Selector Tabs */}
        <div className="flex justify-center gap-2 mb-10 select-none">
          {[
            { id: "week", label: t("leaderboard.tab_week") },
            { id: "month", label: t("leaderboard.tab_month") },
            { id: "all", label: t("leaderboard.tab_all") },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "week" | "month" | "all")}
                className={`px-5 py-2.5 font-black text-sm border-2 transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[4px_4px_0px_#FACC15] -translate-y-0.5"
                    : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FACC15] shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-12 h-12 text-[#3346F0] animate-spin" />
            <p className="font-black text-gray-600">{t("leaderboard.loading")}</p>
          </div>
        ) : sorted.length === 0 ? (
          /* Empty State – no real users yet */
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-[#FACC15] border-4 border-[#0A0A0A] shadow-[6px_6px_0px_#0A0A0A] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-[#0A0A0A]" />
            </div>
            <h2 className="text-2xl font-black text-[#0A0A0A] mb-2">{t("leaderboard.empty_title")}</h2>
            <p className="font-bold text-gray-700 text-sm max-w-sm mx-auto">
              {t("leaderboard.empty_desc")}
            </p>
          </div>
        ) : (
          <>
            {/* ─── TOP 3 PODIUM ────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
              {/* 2nd Place */}
              {top2 && (
                <Card
                  variant="white"
                  className="p-6 text-center order-2 md:order-1 h-80 flex flex-col justify-between shadow-[5px_5px_0px_#0A0A0A]"
                >
                  <div>
                    <Badge variant="blue" size="md" className="mb-3">
                      🥈 {t("leaderboard.second_place")}
                    </Badge>
                    <div className="w-16 h-16 bg-[#E8E8E8] border-2 border-[#0A0A0A] mx-auto flex items-center justify-center shadow-[3px_3px_0px_#0A0A0A]">
                      <CyberIcon name={top2.avatar || "shield"} size={32} />
                    </div>
                    <h4 className="font-black text-xl text-[#0A0A0A] mt-3">{top2.displayName}</h4>
                    <p className="text-xs font-bold text-gray-600">{top2.rank}{top2.country ? ` • ${top2.country}` : ""}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Flame className="w-3.5 h-3.5 text-orange-500" />
                      <span className="text-xs font-black text-orange-600">{top2.streak} {t("leaderboard.days")}</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-[#FAF6EC] border-2 border-[#0A0A0A] font-black text-sm text-[#3346F0]">
                    {getXpForTab(top2).toLocaleString("ar")} XP
                  </div>
                </Card>
              )}

              {/* 1st Place */}
              {top1 && (
                <Card
                  variant="yellow"
                  className="p-8 text-center order-1 md:order-2 h-96 flex flex-col justify-between shadow-[8px_8px_0px_#0A0A0A]"
                >
                  <div>
                    <Badge variant="dark" size="lg" className="mb-3">
                      👑 🏆 {t("leaderboard.first_place")}
                    </Badge>
                    <div className="w-20 h-20 bg-white border-[3px] border-[#0A0A0A] mx-auto flex items-center justify-center shadow-[4px_4px_0px_#0A0A0A]">
                      <CyberIcon name={top1.avatar || "crown"} size={42} />
                    </div>
                    <h4 className="font-black text-2xl text-[#0A0A0A] mt-3">{top1.displayName}</h4>
                    <p className="text-xs font-black text-[#0A0A0A]">{top1.rank}{top1.country ? ` • ${top1.country}` : ""}</p>
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span className="text-sm font-black text-orange-700">{top1.streak} {t("leaderboard.day_streak")}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-[#0A0A0A] border-[3px] border-[#0A0A0A] font-black text-lg text-[#FACC15]">
                    {getXpForTab(top1).toLocaleString("ar")} XP
                  </div>
                </Card>
              )}

              {/* 3rd Place */}
              {top3 && (
                <Card
                  variant="white"
                  className="p-6 text-center order-3 h-72 flex flex-col justify-between shadow-[5px_5px_0px_#0A0A0A]"
                >
                  <div>
                    <Badge variant="orange" size="md" className="mb-3">
                      🥉 {t("leaderboard.third_place")}
                    </Badge>
                    <div className="w-14 h-14 bg-[#FED7AA] border-2 border-[#0A0A0A] mx-auto flex items-center justify-center shadow-[3px_3px_0px_#0A0A0A]">
                      <CyberIcon name={top3.avatar || "bug"} size={28} />
                    </div>
                    <h4 className="font-black text-lg text-[#0A0A0A] mt-3">{top3.displayName}</h4>
                    <p className="text-xs font-bold text-gray-600">{top3.rank}{top3.country ? ` • ${top3.country}` : ""}</p>
                  </div>
                  <div className="p-2.5 bg-[#FAF6EC] border-2 border-[#0A0A0A] font-black text-sm text-[#FF6B00]">
                    {getXpForTab(top3).toLocaleString("ar")} XP
                  </div>
                </Card>
              )}
            </div>

            {/* ─── REST OF PLAYERS ──────────────────────────────────────────── */}
            {restPlayers.length > 0 && (
              <div className="space-y-3 mb-10">
                {restPlayers.map((p, idx) => {
                  const isCurrentUser = user?.uid === p.id;
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-4 p-4 border-2 border-[#0A0A0A] transition-all ${
                        isCurrentUser
                          ? "bg-[#FACC15] shadow-[6px_6px_0px_#0A0A0A] -translate-y-0.5"
                          : "bg-white shadow-[3px_3px_0px_#0A0A0A] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A]"
                      }`}
                    >
                      {/* Rank Number */}
                      <span className="w-8 h-8 bg-[#FAF6EC] border-2 border-[#0A0A0A] font-black text-sm flex items-center justify-center shrink-0">
                        {idx + 4}
                      </span>

                      {/* Avatar */}
                      <div className="w-10 h-10 bg-white border-2 border-[#0A0A0A] flex items-center justify-center shrink-0">
                        <CyberIcon name={p.avatar || "shield"} size={20} />
                      </div>

                      {/* Name & Rank */}
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-[#0A0A0A] truncate">
                          {p.displayName}
                          {isCurrentUser && (
                            <span className="ms-2 text-[10px] font-black bg-[#0A0A0A] text-[#FACC15] px-1.5 py-0.5">
                              {t("leaderboard.you")}
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-bold text-gray-600">{p.rank}{p.country ? ` • ${p.country}` : ""}</p>
                      </div>

                      {/* Streak */}
                      <div className="flex items-center gap-1 shrink-0">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        <span className="text-xs font-black text-orange-600">{p.streak}</span>
                      </div>

                      {/* XP */}
                      <span className="font-black text-sm text-[#3346F0] shrink-0">
                        {getXpForTab(p).toLocaleString("ar")} XP
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Current User Rank Banner */}
            {currentUserRankIndex && currentUserRankIndex > 0 && (
              <Card variant="blue" className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-white" />
                  <div>
                    <p className="font-black text-sm text-white">{t("leaderboard.your_rank")}</p>
                    <p className="text-xs text-white/80 font-bold">
                      {activeTab === "week"
                        ? t("leaderboard.tab_week")
                        : activeTab === "month"
                        ? t("leaderboard.tab_month")
                        : t("leaderboard.tab_all")}
                    </p>
                  </div>
                </div>
                <span className="font-black text-3xl text-[#FACC15]">#{currentUserRankIndex}</span>
              </Card>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}