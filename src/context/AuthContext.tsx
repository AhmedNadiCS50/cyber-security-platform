"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  runTransaction,
} from "firebase/firestore";
import { auth, db, googleProvider, isFirebaseConfigured } from "@/lib/firebase";
import { useContent } from "@/context/ContentContext";
import { getRankByXp } from "@/lib/xpRules";
import {
  getCurrentWeekId,
  getCurrentMonthId,
  getTodayString,
  computeStreak,
  resetPeriodicXp,
  computeEarnedBadges,
  badgeStatsFromProfile,
} from "@/lib/progress";

// The email configured as the platform owner. Accounts matching it get the
// "owner" role on creation (Firestore rules also grant admin rights to this
// verified email, so the owner works even before the profile is written).
const OWNER_EMAIL = (process.env.NEXT_PUBLIC_OWNER_EMAIL || "").trim().toLowerCase();

const isOwnerEmail = (email?: string | null): boolean =>
  Boolean(email) && Boolean(OWNER_EMAIL) && email!.trim().toLowerCase() === OWNER_EMAIL;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserProfile {
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
  /** Ids of daily challenges the learner has solved. */
  solvedChallenges: string[];
  /** Total number of successful Cyber Lab sessions (all time). */
  labSessions: number;
  /** Lab sessions completed on `labSessionDate` (used for the daily limit). */
  labSessionsToday?: number;
  /** Day (YYYY-MM-DD) the `labSessionsToday` counter belongs to. */
  labSessionDate?: string;
  createdAt: string;
  onboardingDone: boolean;
  banned: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isOwner: boolean;
  isFirebaseActive: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  signupWithEmail: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  completeOnboarding: (data: {
    displayName: string;
    age: string;
    level: string;
    avatar: string;
    country?: string;
  }) => Promise<void>;
  addXp: (amount: number, reason?: string) => Promise<void>;
  markLessonCompleted: (lessonId: string, score: number) => Promise<void>;
  markChallengeSolved: (challengeId: string, xp: number) => Promise<void>;
  recordLabSession: (xp: number) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // Content (stages/lessons) drives badge thresholds like "completedLevels".
  const { levels } = useContent();

  /**
   * Persist progress through the server API (`/api/profile`, Admin SDK). The
   * server is the source of truth and recomputes rank/badges/streak. Returns
   * `notConfigured` when the API is unavailable (e.g. Admin SDK credentials not
   * set), so callers can fall back to the legacy client-side path.
   */
  const callProfileApi = useCallback(async (
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<{ ok: boolean; profile?: UserProfile; notConfigured?: boolean }> => {
    if (!isFirebaseConfigured || !auth) return { ok: false, notConfigured: true };
    const current = auth.currentUser;
    if (!current) return { ok: false, notConfigured: true };
    try {
      const token = await current.getIdToken();
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, payload }),
      });
      if (res.status === 503) return { ok: false, notConfigured: true };
      if (!res.ok) return { ok: false };
      const json = (await res.json()) as { profile?: UserProfile };
      if (json && json.profile) return { ok: true, profile: json.profile };
      return { ok: false };
    } catch {
      return { ok: false };
    }
  }, []);

  // Load user from Firestore and apply streak/period resets
  const loadAndEnrichUser = useCallback(async (fbUser: FirebaseUser): Promise<UserProfile | null> => {
    // Preferred path: the server API (Admin SDK) returns the authoritative
    // profile, creating it on first login and applying streak/period resets.
    const api = await callProfileApi("sync");
    if (api.profile) return api.profile;

    if (!db) return null;

    const userRef = doc(db, "users", fbUser.uid);
    const snap = await getDoc(userRef);

    const currentWeekId = getCurrentWeekId();
    const currentMonthId = getCurrentMonthId();

    let profile: UserProfile;

    if (snap.exists()) {
      profile = snap.data() as UserProfile;

      // Backfill fields added after the account was first created.
      const updates: Partial<UserProfile> = {};
      if (!profile.solvedChallenges) updates.solvedChallenges = [];
      if (profile.labSessions === undefined) updates.labSessions = 0;

      // Streak
      const { streak, lastActiveDate } = computeStreak(
        profile.lastActiveDate || "",
        profile.streak || 0
      );
      if (streak !== profile.streak || lastActiveDate !== profile.lastActiveDate) {
        updates.streak = streak;
        updates.lastActiveDate = lastActiveDate;
      }

      // Periodic XP reset
      const periodicResets = resetPeriodicXp(profile, currentWeekId, currentMonthId);
      Object.assign(updates, periodicResets);

      // If anything changed, persist to Firestore
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
        profile = { ...profile, ...updates };
      }
    } else {
      // Brand new user – create profile.
      // NOTE: the Firestore create rule only lets a user self-create with
      // role "user" (anti privilege-escalation). The owner is therefore
      // promoted in a best-effort follow-up update, which the rules DO allow
      // for the configured/verified owner email (isPlatformAdmin).
      profile = {
        uid: fbUser.uid,
        email: fbUser.email || "",
        displayName: fbUser.displayName || "متعلم جديد",
        photoURL: fbUser.photoURL || "",
        avatar: "shield",
        role: "user",
        xp: 0,
        weeklyXp: 0,
        weekId: currentWeekId,
        monthlyXp: 0,
        monthId: currentMonthId,
        streak: 1,
        lastActiveDate: getTodayString(),
        rank: "مستكشف",
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
      await setDoc(userRef, profile);

      if (isOwnerEmail(fbUser.email)) {
        try {
          await updateDoc(userRef, { role: "owner" });
          profile = { ...profile, role: "owner" };
        } catch {
          // Non-fatal: the UI treats the configured owner email as owner
          // regardless of the stored role.
        }
      }
    }

    return profile;
  }, [callProfileApi]);

  // Subscribe to Firebase auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth || !db) {
      // Firebase is required for authentication; there is no offline/demo mode.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        try {
          const profile = await loadAndEnrichUser(fbUser);
          setUser(profile);
        } catch (err) {
          console.error("Error fetching user profile:", err);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [loadAndEnrichUser]);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const applyUser = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
  };

  const refreshUser = async () => {
    if (!user || !db) return;
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) setUser(snap.data() as UserProfile);
    } catch {}
  };

  // ─── Auth Actions ────────────────────────────────────────────────────────────

  const loginWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: "auth/unavailable" };
    }
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const signupWithEmail = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      return { success: false, error: "auth/unavailable" };
    }
    try {
      await createUserWithEmailAndPassword(auth, email, pass);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      return { success: false, error: "auth/unavailable" };
    }
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
    setUser(null);
  };

  // ─── Profile Update ──────────────────────────────────────────────────────────

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;

    const api = await callProfileApi("profile", {
      displayName: data.displayName,
      avatar: data.avatar,
      country: data.country,
      age: data.age,
      level: data.level,
    });
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const updated = { ...user, ...data };
    if (data.xp !== undefined) updated.rank = getRankByXp(data.xp).nameAr;

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), updated);
      } catch (err) {
        console.error("Firestore update error:", err);
      }
    }
    applyUser(updated);
  };

  const completeOnboarding = async (data: {
    displayName: string;
    age: string;
    level: string;
    avatar: string;
    country?: string;
  }) => {
    if (!user) return;

    const api = await callProfileApi("onboarding", data);
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const newXp = (user.xp || 0) + 20;
    const updated: UserProfile = {
      ...user,
      displayName: data.displayName,
      age: data.age,
      level: data.level,
      avatar: data.avatar,
      country: data.country || "",
      onboardingDone: true,
      xp: newXp,
      rank: getRankByXp(newXp).nameAr,
    };

    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "users", user.uid), updated);
    }
    applyUser(updated);
  };

  // ─── XP (uses Firestore increment for safety) ─────────────────────────────

  const addXp = async (amount: number) => {
    if (!user) return;

    const api = await callProfileApi("xp", { amount });
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const newXp = (user.xp || 0) + amount;
    const newWeekly = (user.weeklyXp || 0) + amount;
    const newMonthly = (user.monthlyXp || 0) + amount;
    const newRank = getRankByXp(newXp).nameAr;
    const { streak, lastActiveDate } = computeStreak(user.lastActiveDate, user.streak);
    const newBadges = computeEarnedBadges(
      user.badges,
      badgeStatsFromProfile(user, { xp: newXp, streak }),
      levels
    );

    const updates: Partial<UserProfile> = {
      xp: newXp,
      weeklyXp: newWeekly,
      monthlyXp: newMonthly,
      rank: newRank,
      streak,
      lastActiveDate,
      badges: newBadges,
    };

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (err) {
        console.error("addXp error:", err);
      }
    }
    applyUser({ ...user, ...updates });
  };

  // ─── Mark Lesson Completed ────────────────────────────────────────────────

  const markLessonCompleted = async (lessonId: string, score: number) => {
    if (!user) return;

    const api = await callProfileApi("lesson", { lessonId, score });
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const alreadyDone = user.completedLessons.includes(lessonId);
    const completedLessons = alreadyDone
      ? user.completedLessons
      : [...user.completedLessons, lessonId];
    const xpBonus = alreadyDone ? 0 : 50 + (score >= 100 ? 10 : 0);
    const newXp = user.xp + xpBonus;
    const newWeekly = user.weeklyXp + xpBonus;
    const newMonthly = user.monthlyXp + xpBonus;
    const { streak, lastActiveDate } = computeStreak(user.lastActiveDate, user.streak);
    const newBadges = computeEarnedBadges(
      user.badges,
      badgeStatsFromProfile(user, { xp: newXp, completedLessons, streak }),
      levels
    );

    const updates: Partial<UserProfile> = {
      completedLessons,
      xp: newXp,
      weeklyXp: newWeekly,
      monthlyXp: newMonthly,
      rank: getRankByXp(newXp).nameAr,
      streak,
      lastActiveDate,
      badges: newBadges,
    };

    if (isFirebaseConfigured && db) {
      const database = db;
      try {
        // Also bump the global counter for landing page stats
        const statsRef = doc(database, "settings", "globalStats");
        await runTransaction(database, async (tx) => {
          await tx.update(doc(database, "users", user.uid), updates);
          if (!alreadyDone) {
            try {
              const statsSnap = await tx.get(statsRef);
              if (statsSnap.exists()) {
                tx.update(statsRef, { totalLessonsCompleted: increment(1) });
              } else {
                tx.set(statsRef, { totalLessonsCompleted: 1 });
              }
            } catch {}
          }
        });
      } catch {
        // Fallback: direct update if transaction fails
        try { await updateDoc(doc(database, "users", user.uid), updates); } catch {}
      }
    }
    applyUser({ ...user, ...updates });
  };

  // ─── Mark Challenge Solved ────────────────────────────────────────────────

  const markChallengeSolved = async (challengeId: string, xp: number) => {
    if (!user) return;
    const alreadySolved = (user.solvedChallenges || []).includes(challengeId);
    if (alreadySolved) return;

    const api = await callProfileApi("challenge", { challengeId, xp });
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const solvedChallenges = [...(user.solvedChallenges || []), challengeId];
    const newXp = user.xp + xp;
    const newWeekly = user.weeklyXp + xp;
    const newMonthly = user.monthlyXp + xp;
    const { streak, lastActiveDate } = computeStreak(user.lastActiveDate, user.streak);
    const newBadges = computeEarnedBadges(
      user.badges,
      badgeStatsFromProfile(user, { xp: newXp, solvedChallenges, streak }),
      levels
    );

    const updates: Partial<UserProfile> = {
      solvedChallenges,
      xp: newXp,
      weeklyXp: newWeekly,
      monthlyXp: newMonthly,
      rank: getRankByXp(newXp).nameAr,
      streak,
      lastActiveDate,
      badges: newBadges,
    };

    if (isFirebaseConfigured && db) {
      try {
        const solveRef = doc(db, "challengeSolves", `${user.uid}_${challengeId}`);
        await setDoc(solveRef, {
          uid: user.uid,
          challengeId,
          xp,
          solvedAt: new Date().toISOString(),
        });
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (err) {
        console.error("markChallengeSolved error:", err);
      }
    }
    applyUser({ ...user, ...updates });
  };

  // ─── Record Cyber Lab Session ─────────────────────────────────────────────

  const recordLabSession = async (xp: number) => {
    if (!user) return;

    const api = await callProfileApi("lab", { xp });
    if (!api.notConfigured) {
      if (api.profile) applyUser(api.profile);
      return;
    }

    const today = getTodayString();
    const isSameDay = user.labSessionDate === today;
    const labSessionsToday = (isSameDay ? user.labSessionsToday || 0 : 0) + 1;
    const labSessions = (user.labSessions || 0) + 1;
    const newXp = user.xp + xp;
    const newWeekly = user.weeklyXp + xp;
    const newMonthly = user.monthlyXp + xp;
    const { streak, lastActiveDate } = computeStreak(user.lastActiveDate, user.streak);
    const newBadges = computeEarnedBadges(
      user.badges,
      badgeStatsFromProfile(user, { xp: newXp, labSessions, streak }),
      levels
    );

    const updates: Partial<UserProfile> = {
      labSessions,
      labSessionsToday,
      labSessionDate: today,
      xp: newXp,
      weeklyXp: newWeekly,
      monthlyXp: newMonthly,
      rank: getRankByXp(newXp).nameAr,
      streak,
      lastActiveDate,
      badges: newBadges,
    };

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, "users", user.uid), updates);
      } catch (err) {
        console.error("recordLabSession error:", err);
      }
    }
    applyUser({ ...user, ...updates });
  };

  const isOwner = user?.role === "owner" || isOwnerEmail(user?.email);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isOwner,
        isFirebaseActive: isFirebaseConfigured,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
        updateUserProfile,
        completeOnboarding,
        addXp,
        markLessonCompleted,
        markChallengeSolved,
        recordLabSession,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
