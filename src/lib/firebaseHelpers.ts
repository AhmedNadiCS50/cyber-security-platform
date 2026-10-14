/**
 * firebaseHelpers.ts
 * Shared helpers for reading real data from Firestore (client-side).
 */

import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  where,
  DocumentData,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "@/lib/firebase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  avatar: string;
  rank: string;
  xp: number;
  weeklyXp: number;
  monthlyXp: number;
  streak: number;
  country: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeToday: number;
  lessonsCompleted: number;
  challengesSolved: number;
}

// ─── Leaderboard ──────────────────────────────────────────────────────────────

/**
 * Fetch top N users ordered by xp field.
 * field: "xp" | "weeklyXp" | "monthlyXp"
 */
export async function fetchLeaderboard(
  field: "xp" | "weeklyXp" | "monthlyXp",
  topN = 20
): Promise<LeaderboardEntry[]> {
  if (!isFirebaseConfigured || !db) return [];

  try {
    const q = query(
      collection(db, "users"),
      where("banned", "==", false),
      orderBy(field, "desc"),
      limit(topN)
    );
    const snap = await getDocs(q);
    return snap.docs.map((doc) => {
      const d = doc.data() as DocumentData;
      return {
        id: doc.id,
        displayName: d.displayName || "متعلم مجهول",
        avatar: d.avatar || "shield",
        rank: d.rank || "مستكشف",
        xp: d.xp || 0,
        weeklyXp: d.weeklyXp || 0,
        monthlyXp: d.monthlyXp || 0,
        streak: d.streak || 0,
        country: d.country || "",
      };
    });
  } catch (err) {
    console.error("fetchLeaderboard error:", err);
    return [];
  }
}

// ─── Platform Stats ────────────────────────────────────────────────────────────

/**
 * Get aggregate platform stats from Firestore.
 */
export async function fetchPlatformStats(): Promise<PlatformStats> {
  if (!isFirebaseConfigured || !db) {
    return { totalUsers: 0, activeToday: 0, lessonsCompleted: 0, challengesSolved: 0 };
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const [usersSnap, activeTodaySnap, challengesSnap] = await Promise.all([
      getCountFromServer(collection(db, "users")),
      getCountFromServer(
        query(collection(db, "users"), where("lastActiveDate", "==", today))
      ),
      getCountFromServer(collection(db, "challengeSolves")),
    ]);

    // Approximate: total completedLessons entries from a stats doc if available
    const statsRef = await getDocs(
      query(collection(db, "settings"), where("__name__", "==", "globalStats"))
    );

    let lessonsCompleted = 0;
    if (!statsRef.empty) {
      lessonsCompleted = statsRef.docs[0].data()?.totalLessonsCompleted || 0;
    }

    return {
      totalUsers: usersSnap.data().count,
      activeToday: activeTodaySnap.data().count,
      lessonsCompleted,
      challengesSolved: challengesSnap.data().count,
    };
  } catch (err) {
    console.error("fetchPlatformStats error:", err);
    return { totalUsers: 0, activeToday: 0, lessonsCompleted: 0, challengesSolved: 0 };
  }
}
