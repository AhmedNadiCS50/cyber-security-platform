/**
 * profileServer.ts  —  SERVER ONLY (imports the Firebase Admin SDK).
 *
 * Single place where learner progress is mutated. The client API route
 * (`/api/profile`) verifies the caller's ID token, then delegates here.
 * Running on the Admin SDK means it bypasses Firestore security rules, so
 * all derived values (rank, badges, streak, weekly/monthly XP) are recomputed
 * server-side and never trusted from the client.
 */

import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebaseAdmin";
import { getRankByXp, XP_RULES } from "@/lib/xpRules";
import { SEED_CHALLENGES } from "@/lib/seedData";
import {
  computeStreak,
  resetPeriodicXp,
  getCurrentWeekId,
  getCurrentMonthId,
  getTodayString,
  computeEarnedBadges,
  badgeStatsFromProfile,
} from "@/lib/progress";

export interface ServerProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  age?: string;
  level?: string;
  country?: string;
  avatar: string;
  role: "user" | "owner";
  xp: number;
  weeklyXp: number;
  weekId: string;
  monthlyXp: number;
  monthId: string;
  streak: number;
  lastActiveDate: string;
  rank: string;
  badges: string[];
  completedLessons: string[];
  solvedChallenges: string[];
  labSessions: number;
  labSessionsToday?: number;
  labSessionDate?: string;
  createdAt: string;
  onboardingDone: boolean;
  banned: boolean;
}

export type ProfileAction =
  | "sync"
  | "onboarding"
  | "profile"
  | "xp"
  | "lesson"
  | "challenge"
  | "lab";

export interface DecodedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface ActionResult {
  status: number;
  body: { profile?: ServerProfile; error?: string };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const OWNER_EMAIL = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").toLowerCase();

function buildDefaultProfile(decoded: DecodedUser): ServerProfile {
  const email = decoded.email || "";
  const isOwner = Boolean(OWNER_EMAIL) && email.toLowerCase() === OWNER_EMAIL;
  return {
    uid: decoded.uid,
    email,
    displayName: decoded.name || "متعلم جديد",
    photoURL: decoded.picture || "",
    avatar: "shield",
    role: isOwner ? "owner" : "user",
    xp: 0,
    weeklyXp: 0,
    weekId: getCurrentWeekId(),
    monthlyXp: 0,
    monthId: getCurrentMonthId(),
    streak: 1,
    lastActiveDate: getTodayString(),
    rank: getRankByXp(0).nameAr,
    badges: [],
    completedLessons: [],
    solvedChallenges: [],
    labSessions: 0,
    labSessionsToday: 0,
    labSessionDate: getTodayString(),
    createdAt: new Date().toISOString(),
    onboardingDone: false,
    banned: false,
  };
}

/** Backfill missing fields + advance streak + reset weekly/monthly XP. */
function enrichUpdates(p: ServerProfile): Partial<ServerProfile> {
  const updates: Partial<ServerProfile> = {};
  if (!Array.isArray(p.solvedChallenges)) updates.solvedChallenges = [];
  if (p.labSessions === undefined) updates.labSessions = 0;

  const { streak, lastActiveDate } = computeStreak(p.lastActiveDate || "", p.streak || 0);
  if (streak !== p.streak || lastActiveDate !== p.lastActiveDate) {
    updates.streak = streak;
    updates.lastActiveDate = lastActiveDate;
  }
  Object.assign(updates, resetPeriodicXp(p, getCurrentWeekId(), getCurrentMonthId()));
  return updates;
}

async function resolveChallengeXp(challengeId: string, fallback: number): Promise<number> {
  // Prefer the authoritative Firestore catalogue (admin-uploaded), then the seed.
  try {
    if (adminDb) {
      const snap = await adminDb.collection("challenges").doc(challengeId).get();
      if (snap.exists) {
        const xp = snap.data()?.xp;
        if (typeof xp === "number" && xp >= 0) return Math.min(xp, 200);
      }
    }
  } catch {
    /* fall through to seed */
  }
  const seed = SEED_CHALLENGES.find((c) => c.id === challengeId);
  if (seed) return seed.xp;
  return clamp(fallback, 0, 200);
}

function clamp(n: number, min: number, max: number): number {
  if (typeof n !== "number" || Number.isNaN(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function str(v: unknown, max = 80): string {
  return typeof v === "string" ? v.slice(0, max) : "";
}

// ─── Main entry ───────────────────────────────────────────────────────────────

export async function handleProfileAction(
  decoded: DecodedUser,
  action: ProfileAction,
  payload: Record<string, unknown>
): Promise<ActionResult> {
  if (!adminDb) return { status: 503, body: { error: "server-not-configured" } };

  const uid = decoded.uid;
  const ref = adminDb.collection("users").doc(uid);
  const snap = await ref.get();

  const created = !snap.exists;
  const profile: ServerProfile = created
    ? buildDefaultProfile(decoded)
    : ({ ...(snap.data() as ServerProfile), uid } as ServerProfile);

  // Apply enrichments (backfill + streak + periodic resets) BEFORE any mutation
  // so that XP earned by this action lands on top of a correctly reset counter.
  if (!created) {
    Object.assign(profile, enrichUpdates(profile));
  }

  const applyXp = (delta: number) => {
    profile.xp = (profile.xp || 0) + delta;
    profile.weeklyXp = (profile.weeklyXp || 0) + delta;
    profile.monthlyXp = (profile.monthlyXp || 0) + delta;
    profile.rank = getRankByXp(profile.xp).nameAr;
    profile.badges = computeEarnedBadges(
      profile.badges || [],
      badgeStatsFromProfile(profile, { xp: profile.xp })
    );
  };

  switch (action) {
    case "sync": {
      break;
    }

    case "onboarding": {
      const displayName = str(payload.displayName, 60).trim();
      if (!displayName) return { status: 400, body: { error: "invalid-display-name" } };
      profile.displayName = displayName;
      profile.age = str(payload.age, 8);
      profile.level = str(payload.level, 16);
      profile.avatar = str(payload.avatar, 24) || profile.avatar;
      profile.country = str(payload.country, 40);
      profile.onboardingDone = true;
      profile.xp = (profile.xp || 0) + 20;
      profile.rank = getRankByXp(profile.xp).nameAr;
      break;
    }

    case "profile": {
      if (payload.displayName !== undefined) {
        const displayName = str(payload.displayName, 60).trim();
        if (!displayName) return { status: 400, body: { error: "invalid-display-name" } };
        profile.displayName = displayName;
      }
      if (payload.avatar !== undefined) profile.avatar = str(payload.avatar, 24) || profile.avatar;
      if (payload.country !== undefined) profile.country = str(payload.country, 40);
      if (payload.age !== undefined) profile.age = str(payload.age, 8);
      if (payload.level !== undefined) profile.level = str(payload.level, 16);
      break;
    }

    case "xp": {
      const amount = clamp(Number(payload.amount), 0, 500);
      if (amount > 0) applyXp(amount);
      break;
    }

    case "lesson": {
      const lessonId = str(payload.lessonId, 64);
      if (!lessonId) return { status: 400, body: { error: "invalid-lesson" } };
      const score = clamp(Number(payload.score), 0, 100);
      const alreadyDone = (profile.completedLessons || []).includes(lessonId);
      if (!alreadyDone) {
        profile.completedLessons = [...(profile.completedLessons || []), lessonId];
        const bonus = XP_RULES.LESSON_COMPLETE + (score >= 100 ? XP_RULES.QUIZ_PERFECT_BONUS : 0);
        applyXp(bonus);
        if (adminDb) {
          await adminDb
            .collection("settings")
            .doc("globalStats")
            .set({ totalLessonsCompleted: FieldValue.increment(1) }, { merge: true })
            .catch(() => {});
        }
      }
      break;
    }

    case "challenge": {
      const challengeId = str(payload.challengeId, 64);
      if (!challengeId) return { status: 400, body: { error: "invalid-challenge" } };
      const solved = profile.solvedChallenges || [];
      if (!solved.includes(challengeId)) {
        const xp = await resolveChallengeXp(challengeId, Number(payload.xp));
        profile.solvedChallenges = [...solved, challengeId];
        applyXp(xp);
        if (adminDb) {
          await adminDb
            .collection("challengeSolves")
            .doc(`${uid}_${challengeId}`)
            .set(
              { uid, challengeId, xp, solvedAt: new Date().toISOString() },
              { merge: true }
            )
            .catch(() => {});
        }
      }
      break;
    }

    case "lab": {
      const today = getTodayString();
      const sameDay = profile.labSessionDate === today;
      const doneToday = sameDay ? profile.labSessionsToday || 0 : 0;
      if (doneToday >= XP_RULES.LAB_DAILY_LIMIT) {
        return { status: 409, body: { error: "daily-limit" } };
      }
      profile.labSessions = (profile.labSessions || 0) + 1;
      profile.labSessionsToday = doneToday + 1;
      profile.labSessionDate = today;
      applyXp(XP_RULES.LAB_SESSION);
      break;
    }

    default:
      return { status: 400, body: { error: "unknown-action" } };
  }

  await ref.set(profile, { merge: true });

  return { status: 200, body: { profile } };
}
