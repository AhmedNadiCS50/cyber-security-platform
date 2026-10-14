"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge, SectionNumberBadge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon, type CyberIconName } from "@/components/common/CyberIcon";
import { useContent } from "@/context/ContentContext";
import { fetchPlatformStats, PlatformStats } from "@/lib/firebaseHelpers";
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Scroll,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { t, locale, dir } = useTranslation();
  const { user } = useAuth();
  const { levels, totalLessons } = useContent();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    fetchPlatformStats().then(setPlatformStats).catch(() => {});
  }, []);

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const faqs = [
    { q: t("faq.q1"), a: t("faq.a1") },
    { q: t("faq.q2"), a: t("faq.a2") },
    { q: t("faq.q3"), a: t("faq.a3") },
    { q: t("faq.q4"), a: t("faq.a4") },
    { q: t("faq.q5"), a: t("faq.a5") },
  ];

  const stageIcons: CyberIconName[] = ["shield", "network", "terminal", "bug", "key"];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC] selection:bg-[#FACC15]">
      <Navbar />

      <main className="flex-1">
        {/* =============================================== */}
        {/* 2) HERO SECTION                                */}
        {/* =============================================== */}
        <section className="relative overflow-hidden pt-8 pb-16 sm:py-20 lg:py-24 border-b-[4px] border-[#0A0A0A]">
          {/* Subtle cyber grid background */}
          <div className="absolute inset-0 bg-cyber-grid pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: Headlines & CTA */}
              <div className="lg:col-span-7 space-y-6 text-start">
                <div className="inline-flex items-center gap-2">
                  <Badge variant="yellow" size="lg" className="shadow-[3px_3px_0px_#0A0A0A]">
                    <Sparkles className="w-4 h-4 fill-current text-[#0A0A0A]" />
                    <span>{t("hero.badge")}</span>
                  </Badge>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0A0A0A] leading-[1.15] tracking-tight">
                  {t("hero.title_part1")}{" "}
                  <HandDrawnUnderline color="#FACC15">
                    {t("hero.title_highlight")}
                  </HandDrawnUnderline>
                </h1>

                <p className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 leading-relaxed max-w-2xl">
                  {t("hero.subtitle")}
                </p>

                {/* CTA Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <Button
                    href={user ? "/learn" : "/signup"}
                    variant="primary"
                    size="lg"
                    className="font-black text-lg py-4 px-8"
                    icon={<ArrowIcon className="w-5 h-5" />}
                    iconPosition="end"
                  >
                    {t("hero.cta_start")}
                  </Button>

                  <Button
                    href="/learn"
                    variant="outline"
                    size="lg"
                    className="font-bold text-base py-4"
                  >
                    {t("hero.cta_explore")}
                  </Button>
                </div>

                {/* Stats Bar */}
                <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t-[3px] border-[#0A0A0A]">
                  <div className="bg-white p-3 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                    <p className="font-black text-2xl sm:text-3xl text-[#3346F0]">{totalLessons}+</p>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{t("hero.stats_lessons")}</p>
                  </div>
                  <div className="bg-white p-3 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                    <p className="font-black text-2xl sm:text-3xl text-[#FF6B00]">
                      {platformStats && platformStats.totalUsers > 0
                        ? `${platformStats.totalUsers.toLocaleString("ar")}+`
                        : "0"}
                    </p>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{t("hero.stats_students")}</p>
                  </div>
                  <div className="bg-white p-3 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                    <p className="font-black text-2xl sm:text-3xl text-[#0A0A0A]">18+</p>
                    <p className="text-xs font-bold text-gray-600 mt-0.5">{t("hero.stats_hours")}</p>
                  </div>
                  <div className="bg-[#FACC15] p-3 border-2 border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]">
                    <p className="font-black text-2xl sm:text-3xl text-[#0A0A0A]">4.9 ★</p>
                    <p className="text-xs font-bold text-black mt-0.5">{t("hero.stats_rating")}</p>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual Graphic (simulated terminal) */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative Frame */}
                  <div className="relative border-[4px] border-[#0A0A0A] bg-white shadow-[10px_10px_0px_#0A0A0A] overflow-hidden group">
                    <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-[#0A0A0A] p-5 font-mono text-[12.5px] sm:text-[13.5px] leading-relaxed" dir="ltr">
                      <p className="text-[#8B5CF6]">Cyber Shell v1.0 — simulated environment</p>
                      <p className="text-[#FACC15]">
                        student@cyber:~$ <span className="text-[#22C55E]">cat flag.txt</span>
                      </p>
                      <p className="text-[#22C55E]">CYBER&#123;w3lc0me_t0_th3_l4b&#125;</p>
                      <p className="text-[#FACC15] mt-2">
                        student@cyber:~$ <span className="text-[#22C55E]">nmap -sV target.local</span>
                      </p>
                      <p className="text-[#22C55E]">22/tcp open ssh OpenSSH 9.6</p>
                      <p className="text-[#22C55E]">80/tcp open http nginx 1.25</p>
                      <p className="text-[#22C55E]">443/tcp open https</p>
                      <p className="text-[#FACC15] mt-2">
                        student@cyber:~$ <span className="text-[#22C55E]">whoami</span>
                      </p>
                      <p className="text-[#22C55E]">ethical-hacker</p>
                      <p className="text-[#FACC15] mt-2">
                        student@cyber:~$ <span className="animate-pulse">▊</span>
                      </p>
                    </div>

                    {/* Floating Sticker */}
                    <div className="absolute -top-6 -end-6 hidden sm:flex items-center gap-2 p-3 bg-[#FACC15] border-[2.5px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] rotate-6">
                      <CyberIcon name="flag" size={24} />
                      <span className="font-black text-xs">فكّر كالهاكر!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =============================================== */}
        {/* 3) FAQ SECTION                                  */}
        {/* =============================================== */}
        <section className="py-16 sm:py-24 bg-white border-b-[4px] border-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 mb-3">
                <SectionNumberBadge num="01" />
                <span className="font-black text-sm uppercase tracking-wider text-[#3346F0]">
                  {t("faq.tag")}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0A0A0A]">
                {t("faq.title")}
              </h2>
              <p className="text-sm sm:text-base font-bold text-gray-700 mt-2">
                {t("faq.subtitle")}
              </p>
            </div>

            <div className="space-y-4 max-w-3xl mx-auto">
              {faqs.map((faq, idx) => (
                <Card
                  key={idx}
                  variant="cream"
                  className="p-6 group overflow-hidden transition-all"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-black text-lg text-[#0A0A0A] flex-1 text-start">
                      {faq.q}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 text-[#3346F0] shrink-0 transition-transform ${openFaq === idx ? "rotate-180" : ""}`}
                    />
                  </div>
                  <div className="overflow-hidden transition-all duration-300">
                    {openFaq === idx && (
                      <p className="mt-4 font-bold text-sm text-gray-700 leading-relaxed">{faq.a}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================== */}
        {/* 4) CTA SECTION                                  */}
        {/* =============================================== */}
        <section className="py-16 sm:py-24 bg-[#0A0A0A] border-b-[4px] border-[#0A0A0A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4">
              {t("cta.title")}
            </h2>
            <p className="text-lg font-bold text-gray-300 mb-8 max-w-2xl mx-auto">
              {t("cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                href="/signup"
                variant="primary"
                size="lg"
                className="font-black text-lg py-4 px-10"
              >
                {t("cta.signup")}
              </Button>
              <Button
                href="/learn"
                variant="outline"
                size="lg"
                className="font-bold text-base py-4 px-8 border-white text-white hover:bg-white/10"
              >
                {t("cta.explore")}
              </Button>
            </div>
          </div>
        </section>

        {/* =============================================== */}
        {/* 5) FOOTER LINKS / FOOTER IS SEPARATE COMPONENT  */}
        {/* =============================================== */}
      </main>

      <Footer />
    </div>
  );
}