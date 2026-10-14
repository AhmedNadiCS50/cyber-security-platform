import { NextResponse } from "next/server";
import { SEED_LEVELS } from "@/lib/seedData";
import { gradeQuiz, type AnswerValue } from "@/lib/questionUtils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lessonId, answers } = body as {
      lessonId?: string;
      answers?: Record<string, AnswerValue | undefined>;
    };

    const allLessons = SEED_LEVELS.flatMap((l) => l.lessons);
    const lesson = allLessons.find((l) => l.id === lessonId);

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const score = gradeQuiz(lesson.quiz, answers || {});
    const passScore = lesson.passScore || 70;
    const passed = score >= passScore;

    return NextResponse.json({
      score,
      passed,
      passScore,
      xpEarned: passed ? lesson.xp : 0,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
