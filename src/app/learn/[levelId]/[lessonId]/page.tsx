"use client";

import React, { useState, use, Suspense } from "react";
import Link from "next/link";
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
import { AnswerValue, gradeQuiz } from "@/lib/questionUtils";
import { BookOpen, HelpCircle, RotateCcw, ArrowLeft, ArrowRight } from "lucide-react";
import { VideoPlayer } from "@/components/common/VideoPlayer";

interface PageProps {
  params: Promise<{ levelId: string; lessonId: string }>;
}

/** Tiny inline rich-text renderer: supports **bold** and `code`. */
function RichText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).filter(Boolean);
  return (
    <p className="text-sm sm:text-base font-bold text-gray-800 leading-loose">
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-black text-[#0A0A0A]">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              dir="ltr"
              className="font-mono bg-[#0A0A0A] text-[#22C55E] px-1.5 py-0.5 text-[0.85em] rounded-none"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </p>
  );
}

function LessonContent({ params }: PageProps) {
  const { levelId, lessonId } = use(params);
  const { t, locale, dir } = useTranslation();
  const { markLessonCompleted } = useAuth();
  const { levels } = useContent();

  // Quiz State
  const [answers, setAnswers] = useState<Record<string, AnswerValue | undefined>>({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Find level and lesson (content is dynamic, so both may be missing).
  const level = levels.find((l) => l.id === levelId) || levels[0];
  const lesson = level?.lessons.find((l) => l.id === lessonId) || level?.lessons[0];

  if (!level || !lesson) {
    return (
      <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8 text-center font-black text-gray-600">
          {locale === "ar" ? "هذا الدرس غير موجود." : "This lesson does not exist."}
        </main>
        <Footer />
      </div>
    );
  }

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  const handleQuizSubmit = async () => {
    const score = gradeQuiz(lesson.quiz, answers);
    setQuizScore(score);
    setIsQuizSubmitted(true);

    if (score >= (lesson.passScore || 70)) {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#FACC15", "#3346F0", "#FF6B00", "#22C55E"],
      });
      await markLessonCompleted(lesson.id, score);
    }
  };

  const handleRetakeQuiz = () => {
    setAnswers({});
    setIsQuizSubmitted(false);
    setQuizScore(0);
  };

  const content = locale === "ar" ? lesson.contentAr : lesson.contentEn;
  const hasVideo = Boolean(lesson.youtubeId);

  // Find next lesson
  const currentIdx = level.lessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = level.lessons[currentIdx + 1] || null;
  const passed = quizScore >= (lesson.passScore || 70);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-600 mb-4 select-none">
          <Link href="/learn" className="hover:text-[#3346F0] underline">
            {t("nav.learn")}
          </Link>
          <span>/</span>
          <span>{locale === "ar" ? level.titleAr : level.titleEn}</span>
          <span>/</span>
          <span className="text-[#0A0A0A] font-black">{locale === "ar" ? lesson.titleAr : lesson.titleEn}</span>
        </div>

        {/* Lesson Header */}
        <div className="mb-6 pb-4 border-b-2 border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="yellow" size="sm">
              +{lesson.xp} XP
            </Badge>
            <Badge variant="blue" size="sm">
              {locale === "ar" ? `الدرس ${lesson.order}` : `Lesson ${lesson.order}`}
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>{locale === "ar" ? lesson.titleAr : lesson.titleEn}</HandDrawnUnderline>
          </h1>
          <p className="text-sm sm:text-base font-bold text-gray-700 mt-2">
            {locale === "ar" ? lesson.descriptionAr : lesson.descriptionEn}
          </p>
        </div>

        {/* VIDEO (only when a video is attached) */}
        {hasVideo && (
          <div className="mb-10">
            <h2 className="font-black text-lg text-[#0A0A0A] mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3346F0]" />
              {t("learn.video_title")}
            </h2>
            <VideoPlayer
              videoId={lesson.youtubeId!}
              lessonId={lesson.id}
              title={locale === "ar" ? lesson.titleAr : lesson.titleEn}
              className="border-[3.5px] border-[#0A0A0A] shadow-[8px_8px_0px_#0A0A0A]"
            />
          </div>
        )}

        {/* TEXT/CONTENT NOTES */}
        {content && (
          <Card variant="white" className="p-6 sm:p-8 shadow-[6px_6px_0px_#0A0A0A] mb-8">
            <h2 className="font-black text-lg text-[#0A0A0A] mb-3 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#3346F0]" />
              {t("learn.content_title")}
            </h2>
            <RichText text={content} />
          </Card>
        )}

        {/* INTERACTIVE QUIZ SECTION */}
        {lesson.quiz.length > 0 && (
          <Card variant="white" className="p-6 sm:p-10 shadow-[8px_8px_0px_#0A0A0A] mb-8">
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-[#0A0A0A]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#FACC15] border-2 border-[#0A0A0A] flex items-center justify-center font-black">
                  <HelpCircle className="w-6 h-6 text-[#0A0A0A]" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A0A0A]">
                  {t("learn.quiz_title")}
                </h2>
              </div>
              <span className="text-xs font-bold text-gray-600">
                {t("learn.quiz_pass_rate")}: {lesson.passScore}%
              </span>
            </div>

            {/* Quiz Questions List */}
            <div className="space-y-6">
              {lesson.quiz.map((q, qIndex) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  index={qIndex}
                  answer={answers[q.id]}
                  onAnswer={(ans) => setAnswers((prev) => ({ ...prev, [q.id]: ans }))}
                  submitted={isQuizSubmitted}
                />
              ))}
            </div>

            {/* Quiz Action Submit / Result */}
            <div className="mt-8 pt-6 border-t-2 border-[#0A0A0A]">
              {!isQuizSubmitted ? (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleQuizSubmit}
                  className="w-full font-black text-lg py-4"
                >
                  {t("learn.submit_quiz")}
                </Button>
              ) : (
                <div className="space-y-4 text-center">
                  <div
                    className={`p-6 border-[3px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] ${
                      passed ? "bg-green-100 text-green-900" : "bg-red-100 text-red-900"
                    }`}
                  >
                    <p className="font-black text-2xl mb-1">
                      {t("learn.score_label")}: {quizScore}%
                    </p>
                    <p className="font-bold text-sm">
                      {passed ? t("learn.quiz_passed") : t("learn.quiz_failed")}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="outline"
                      size="md"
                      onClick={handleRetakeQuiz}
                      icon={<RotateCcw className="w-4 h-4" />}
                    >
                      {t("learn.retake_quiz")}
                    </Button>

                    {nextLesson && passed && (
                      <Button
                        href={`/learn/${level.id}/${nextLesson.id}`}
                        variant="primary"
                        size="md"
                        icon={<ArrowIcon className="w-4 h-4" />}
                        iconPosition="end"
                      >
                        {t("learn.next_lesson")}
                      </Button>
                    )}

                    <Button href="/learn" variant="dark" size="md">
                      {t("learn.back_to_path")}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function LessonDetailPage(props: PageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#FAF6EC] flex items-center justify-center font-black text-lg">
          جاري تحميل الدرس...
        </div>
      }
    >
      <LessonContent {...props} />
    </Suspense>
  );
}
