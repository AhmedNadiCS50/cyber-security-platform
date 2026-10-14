"use client";

import React, { useState, useMemo } from "react";
import confetti from "canvas-confetti";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { QuestionCard } from "@/components/question/QuestionCard";
import { useContent } from "@/context/ContentContext";
import { AnswerValue, checkAnswer } from "@/lib/questionUtils";
import {
  Lightbulb,
  RotateCcw,
  Eye,
  CheckCircle2,
  XCircle,
  Flame,
  Target,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

export default function ChallengesPage() {
  const { t, locale, dir } = useTranslation();
  const { user, markChallengeSolved } = useAuth();
  const { challenges: allChallenges } = useContent();

  const challenges = useMemo(
    () => allChallenges.filter((c) => c.published),
    [allChallenges]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = challenges[currentIndex] || challenges[0];

  const [answer, setAnswer] = useState<AnswerValue | undefined>(undefined);
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  const solvedList = user?.solvedChallenges || [];
  const isAlreadySolved = current ? solvedList.includes(current.id) : false;

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const difficultyLabel = (d: string) =>
    d === "easy"
      ? t("challenges.difficulty_easy")
      : d === "medium"
      ? t("challenges.difficulty_medium")
      : t("challenges.difficulty_hard");

  const goTo = (index: number) => {
    setCurrentIndex(index);
    setAnswer(undefined);
    setSubmitted(false);
    setIsCorrect(false);
    setShowHint(false);
    setShowSolution(false);
  };

  const handleCheck = () => {
    if (!current) return;
    const ok = checkAnswer(current.question, answer);
    setSubmitted(true);
    setIsCorrect(ok);
    if (ok && !isAlreadySolved) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#FACC15", "#3346F0", "#FF6B00", "#22C55E"],
      });
      void markChallengeSolved(current.id, current.xp);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <Badge variant="orange" size="md" className="mb-2">
            <Flame className="w-4 h-4 fill-current text-white" />
            <span>{t("challenges.subtitle")}</span>
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>{t("challenges.title")}</HandDrawnUnderline>
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================== */}
          {/* LEFT: CURRENT CHALLENGE (7 COLS)            */}
          {/* =========================================== */}
          <div className="lg:col-span-7">
            {current && (
              <Card
                variant="white"
                className="p-6 sm:p-8 w-full shadow-[8px_8px_0px_#0A0A0A]"
              >
                <div className="w-full flex items-center justify-between mb-4 pb-3 border-b-2 border-[#0A0A0A]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 bg-[#0A0A0A] text-white font-black text-xs flex items-center justify-center">
                      {currentIndex + 1}
                    </span>
                    <h3 className="font-black text-lg text-[#0A0A0A]">
                      {locale === "ar" ? current.titleAr : current.titleEn}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="yellow" size="sm">
                      +{current.xp} XP
                    </Badge>
                    <Badge
                      variant={
                        current.difficulty === "easy"
                          ? "green"
                          : current.difficulty === "medium"
                          ? "blue"
                          : "orange"
                      }
                      size="sm"
                    >
                      {difficultyLabel(current.difficulty)}
                    </Badge>
                  </div>
                </div>

                {isAlreadySolved && (
                  <div className="mb-4 p-2.5 bg-green-100 border-2 border-green-700 text-green-900 font-black text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-700" />
                    <span>{t("challenges.already_solved")}</span>
                  </div>
                )}

                {/* The challenge question itself */}
                <QuestionCard
                  question={current.question}
                  index={0}
                  answer={answer}
                  onAnswer={setAnswer}
                  submitted={submitted}
                  showExplanation={submitted}
                />

                {/* Result banners */}
                {submitted && isCorrect && (
                  <div className="mt-4 p-4 bg-green-100 border-2 border-green-700 text-green-900 flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-black text-sm">{t("challenges.solved_title")}</p>
                      <p className="font-bold text-xs mt-0.5">{t("challenges.solved_msg")}</p>
                    </div>
                  </div>
                )}

                {submitted && !isCorrect && (
                  <div className="mt-4 p-3 bg-red-100 border-2 border-red-700 text-red-900 font-black text-sm flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-700" />
                    <span>{t("challenges.wrong_msg")}</span>
                  </div>
                )}

                {/* Controls */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {!submitted || !isCorrect ? (
                    <Button
                      variant="primary"
                      size="md"
                      onClick={handleCheck}
                      icon={<Target className="w-4 h-4" />}
                    >
                      {submitted ? t("challenges.retry_btn") : t("challenges.submit_btn")}
                    </Button>
                  ) : (
                    currentIndex < challenges.length - 1 && (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => goTo(currentIndex + 1)}
                        icon={<ArrowIcon className="w-4 h-4" />}
                        iconPosition="end"
                      >
                        {t("challenges.next_btn")}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => setShowHint(!showHint)}
                    icon={<Lightbulb className="w-4 h-4 text-[#FACC15]" />}
                  >
                    {t("challenges.hint_btn")}
                  </Button>

                  <Button
                    variant="dark"
                    size="md"
                    onClick={() => setShowSolution(!showSolution)}
                    icon={<Eye className="w-4 h-4" />}
                  >
                    {t("challenges.solution_btn")}
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    onClick={() => goTo(currentIndex)}
                    icon={<RotateCcw className="w-4 h-4" />}
                  >
                    {t("challenges.retry_btn")}
                  </Button>
                </div>

                {/* Hint */}
                {showHint && (
                  <div className="mt-4 p-3.5 bg-yellow-50 border-2 border-[#FACC15] text-xs font-bold text-gray-800 leading-relaxed">
                    💡 {locale === "ar" ? current.hintAr : current.hintEn}
                  </div>
                )}

                {/* Solution */}
                {showSolution && (
                  <div className="mt-4 p-3.5 bg-blue-50 border-2 border-[#3346F0] text-xs font-black text-[#3346F0] leading-relaxed">
                    ✅ {locale === "ar" ? current.question.explanationAr : current.question.explanationEn}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* =========================================== */}
          {/* RIGHT: ARCHIVE LIST (5 COLS)                */}
          {/* =========================================== */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-4 bg-white border-2 border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A]">
              <h3 className="font-black text-lg text-[#0A0A0A] mb-1">
                {t("challenges.archive_title")}
              </h3>
              <p className="text-xs font-bold text-gray-600">
                {t("challenges.archive_subtitle")}
              </p>
            </div>

            <div className="space-y-2.5 max-h-[540px] overflow-y-auto pe-1">
              {challenges.map((ch, idx) => {
                const isCurrent = idx === currentIndex;
                const isDone = solvedList.includes(ch.id);

                return (
                  <button
                    key={ch.id}
                    onClick={() => goTo(idx)}
                    className={`w-full text-start p-3.5 border-2 transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? "bg-[#FACC15] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] -translate-x-1"
                        : "bg-white border-[#0A0A0A] hover:bg-[#FAF6EC]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 bg-[#0A0A0A] text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h4 className="font-black text-sm text-[#0A0A0A]">
                          {locale === "ar" ? ch.titleAr : ch.titleEn}
                        </h4>
                        <span className="text-[10px] font-bold text-gray-500">
                          {difficultyLabel(ch.difficulty)}
                        </span>
                      </div>
                    </div>

                    {isDone ? (
                      <span className="text-xs font-black text-green-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> {t("challenges.already_solved")}
                      </span>
                    ) : (
                      <span className="text-xs font-black text-[#3346F0]">
                        +{ch.xp} {t("challenges.points")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
