/**
 * questionUtils.ts
 *
 * Shared answer model + grading for every question type used across the
 * platform (lessons AND challenges). The same helpers are used by the UI and
 * by the server API route so grading stays consistent.
 */

import type { Question } from "./seedData";

export type AnswerValue =
  | { type: "mcq"; index: number }
  | { type: "terminal"; text: string }
  | { type: "flag"; text: string }
  | { type: "code"; code: string };

/** Collapse whitespace + lowercase so `LS  -la` still matches `ls -la`. */
export function normalizeCommand(input: string): string {
  return input.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Grade a single question against the learner's answer. */
export function checkAnswer(q: Question, ans: AnswerValue | undefined): boolean {
  if (!ans) return false;

  switch (q.type) {
    case "mcq":
      return ans.type === "mcq" && ans.index === q.correctIndex;

    case "terminal": {
      if (ans.type !== "terminal") return false;
      const value = normalizeCommand(ans.text);
      if (!value) return false;
      return (q.acceptedAnswers || []).some((a) => normalizeCommand(a) === value);
    }

    case "flag": {
      if (ans.type !== "flag") return false;
      const value = ans.text.trim().toLowerCase();
      if (!value) return false;
      const expected = (q.expectedFlag || "").trim().toLowerCase();
      return expected.length > 0 && value === expected;
    }

    case "code": {
      if (ans.type !== "code") return false;
      if (q.expectedPattern) {
        try {
          return new RegExp(q.expectedPattern, "m").test(ans.code);
        } catch {
          return false;
        }
      }
      if (q.solutionCode) {
        return (
          ans.code.trim().replace(/\s+/g, " ") ===
          q.solutionCode.trim().replace(/\s+/g, " ")
        );
      }
      return ans.code.trim().length > 0;
    }

    default:
      return false;
  }
}

/** Score a whole quiz: returns percentage 0-100. */
export function gradeQuiz(
  quiz: Question[],
  answers: Record<string, AnswerValue | undefined>
): number {
  const total = quiz.length;
  if (total === 0) return 100;
  const earned = quiz.reduce(
    (acc, q) => acc + (checkAnswer(q, answers[q.id]) ? 1 : 0),
    0
  );
  return Math.round((earned / total) * 100);
}

/** Count how many questions were answered correctly. */
export function countCorrect(
  quiz: Question[],
  answers: Record<string, AnswerValue | undefined>
): number {
  return quiz.reduce((acc, q) => acc + (checkAnswer(q, answers[q.id]) ? 1 : 0), 0);
}
