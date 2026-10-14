/**
 * progress.ts
 * Pure, environment-agnostic helpers for computing learner progress.
 * Shared by the client (optimistic UI / fallback) and the server API
 * (source of truth) so both agree on the exact same rules.
 */

import { BADGES } from "@/lib/xpRules";
import {
  countCompletedLevels,
  totalLessonsIn,
  SEED_LEVELS,
  type Level,
} from "@/lib/seedData";

// ─── Date helpers ─────────────────────────────────────────────────────────────

export function getCurrentWeekId(date: Date = new Date()): string {
  const year = date.getUTCFullYear();
  const onejan = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(
    ((date.getTime() - onejan.getTime()) / 86400000 + onejan.getUTCDay() + 1) / 7
  );
  return `${year}-W${week}`;
}

export function getCurrentMonthId(date: Date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function getTodayString(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

// ─── Streak updater ───────────────────────────────────────────────────────────

export function computeStreak(
  lastActiveDate: string,
  currentStreak: number,
  now: Date = new Date()
): { streak: number; lastActiveDate: string } {
  const today = getTodayString(now);
  if (lastActiveDate === today) return { streak: currentStreak, lastActiveDate };
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = getTodayString(yesterday);
  if (lastActiveDate === yStr) {
    return { streak: currentStreak + 1, lastActiveDate: today };
  }
  return { streak: 1, lastActiveDate: today };
}

// ─── Weekly/Monthly XP reset ──────────────────────────────────────────────────

export interface PeriodicState {
  weekId?: string;
  monthId?: string;
}

export interface PeriodicResets {
  weeklyXp?: number;
  weekId?: string;
  monthlyXp?: number;
  monthId?: string;
}

export function resetPeriodicXp(
  data: PeriodicState,
  currentWeekId: string,
  currentMonthId: string
): PeriodicResets {
  const updates: PeriodicResets = {};
  if (data.weekId !== currentWeekId) {
    updates.weeklyXp = 0;
    updates.weekId = currentWeekId;
  }
  if (data.monthId !== currentMonthId) {
    updates.monthlyXp = 0;
    updates.monthId = currentMonthId;
  }
  return updates;
}

// ─── Badge checker ────────────────────────────────────────────────────────────

export interface BadgeStats {
  xp: number;
  completedLessons: string[];
  streak: number;
  solvedChallenges: string[];
  labSessions: number;
}

export interface ProgressProfileLike {
  xp?: number;
  completedLessons?: string[];
  streak?: number;
  solvedChallenges?: string[];
  labSessions?: number;
}

/**
 * Evaluate every badge condition declared in xpRules.BADGES.
 * Supported conditions:
 *   "completedLessons >= N" | "completedLevels >= N" | "streak >= N"
 *   "xp >= N" | "challengesSolved >= N" | "labSessions >= N" | "allLessonsDone"
 */
export function computeEarnedBadges(
  existing: string[],
  stats: BadgeStats,
  levels: Level[] = SEED_LEVELS
): string[] {
  const earned = [...existing];
  const completedLevels = countCompletedLevels(stats.completedLessons, levels);
  const totalLessons = totalLessonsIn(levels);

  for (const badge of BADGES) {
    if (earned.includes(badge.id)) continue;

    let unlocked = false;
    const condition = badge.condition;

    if (condition === "allLessonsDone") {
      unlocked = totalLessons > 0 && stats.completedLessons.length >= totalLessons;
    } else {
      const match = condition.match(/^(\w+)\s*>=\s*(\d+)$/);
      if (match) {
        const key = match[1];
        const threshold = Number(match[2]);
        switch (key) {
          case "completedLessons":
            unlocked = stats.completedLessons.length >= threshold;
            break;
          case "completedLevels":
            unlocked = completedLevels >= threshold;
            break;
          case "streak":
            unlocked = stats.streak >= threshold;
            break;
          case "xp":
            unlocked = stats.xp >= threshold;
            break;
          case "challengesSolved":
            unlocked = stats.solvedChallenges.length >= threshold;
            break;
          case "labSessions":
            unlocked = stats.labSessions >= threshold;
            break;
        }
      }
    }

    if (unlocked) earned.push(badge.id);
  }
  return earned;
}

/** Build a BadgeStats object out of a (possibly partial) profile. */
export function badgeStatsFromProfile(
  profile: ProgressProfileLike,
  overrides: Partial<BadgeStats> = {}
): BadgeStats {
  return {
    xp: profile.xp ?? 0,
    completedLessons: profile.completedLessons ?? [],
    streak: profile.streak ?? 0,
    solvedChallenges: profile.solvedChallenges ?? [],
    labSessions: profile.labSessions ?? 0,
    ...overrides,
  };
}
