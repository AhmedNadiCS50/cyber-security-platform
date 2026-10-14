export interface RankInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  minXp: number;
  /** Cyber icon name (see CyberIcon.tsx) */
  icon: string;
  color: string;
}

export const RANKS: RankInfo[] = [
  { id: "explorer", nameAr: "مستكشف", nameEn: "Explorer", minXp: 0, icon: "compass", color: "#E8E8E8" },
  { id: "trainee", nameAr: "متدرّب", nameEn: "Trainee", minXp: 500, icon: "terminal", color: "#FACC15" },
  { id: "analyst", nameAr: "محلل أمن", nameEn: "Security Analyst", minXp: 1500, icon: "shield", color: "#3346F0" },
  { id: "pentester", nameAr: "مخترق أخلاقي", nameEn: "Ethical Hacker", minXp: 3000, icon: "bug", color: "#8B5CF6" },
  { id: "redteam", nameAr: "قائد الفريق الأحمر", nameEn: "Red Team Lead", minXp: 6000, icon: "swords", color: "#FF6B00" },
  { id: "researcher", nameAr: "باحث ثغرات", nameEn: "Vulnerability Researcher", minXp: 10000, icon: "brain", color: "#EC4899" },
  { id: "legend", nameAr: "أسطورة الأمن السيبراني", nameEn: "Cyber Security Legend", minXp: 20000, icon: "crown", color: "#FACC15" },
];

export function getRankByXp(xp: number): RankInfo {
  let currentRank = RANKS[0];
  for (const rank of RANKS) {
    if (xp >= rank.minXp) {
      currentRank = rank;
    } else {
      break;
    }
  }
  return currentRank;
}

export function getNextRank(xp: number): { nextRank: RankInfo | null; xpNeeded: number; progressPercent: number } {
  const current = getRankByXp(xp);
  const currentIndex = RANKS.findIndex((r) => r.id === current.id);
  const next = RANKS[currentIndex + 1] || null;

  if (!next) {
    return { nextRank: null, xpNeeded: 0, progressPercent: 100 };
  }

  const currentMin = current.minXp;
  const targetXp = next.minXp;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((xp - currentMin) / (targetXp - currentMin)) * 100)));
  const xpNeeded = Math.max(0, targetXp - xp);

  return { nextRank: next, xpNeeded, progressPercent };
}

export interface BadgeInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  icon: string;
  /**
   * Machine-readable condition. Supported forms (see AuthContext.computeEarnedBadges):
   *   "completedLessons >= N" | "completedLevels >= N" | "streak >= N"
   *   "xp >= N" | "challengesSolved >= N" | "labSessions >= N" | "allLessonsDone"
   */
  condition: string;
  xpReward: number;
}

export const BADGES: BadgeInfo[] = [
  {
    id: "first_lesson",
    nameAr: "أول خطوة",
    nameEn: "First Step",
    descAr: "أكملت أول درس في مسار الأمن السيبراني",
    descEn: "Completed your first cyber security lesson",
    icon: "🛡️",
    condition: "completedLessons >= 1",
    xpReward: 20,
  },
  {
    id: "lessons_5",
    nameAr: "متعلّم مجتهد",
    nameEn: "Diligent Learner",
    descAr: "أنهيت 5 دروس تعليمية بنجاح",
    descEn: "Successfully completed 5 lessons",
    icon: "📚",
    condition: "completedLessons >= 5",
    xpReward: 50,
  },
  {
    id: "first_level",
    nameAr: "فاتح المراحل",
    nameEn: "Stage Conqueror",
    descAr: "أنهيت المرحلة الأولى بالكامل",
    descEn: "Completed the first stage completely",
    icon: "🚩",
    condition: "completedLevels >= 1",
    xpReward: 100,
  },
  {
    id: "streak_3",
    nameAr: "بداية العادة",
    nameEn: "Habit Starter",
    descAr: "حافظت على ستريك 3 أيام متتالية",
    descEn: "Maintained a 3-day active streak",
    icon: "🔥",
    condition: "streak >= 3",
    xpReward: 30,
  },
  {
    id: "streak_7",
    nameAr: "أسبوع ناري",
    nameEn: "Weekly Flame",
    descAr: "حافظت على ستريك 7 أيام كاملة",
    descEn: "Maintained a 7-day active streak",
    icon: "⚡",
    condition: "streak >= 7",
    xpReward: 70,
  },
  {
    id: "streak_30",
    nameAr: "التزام المحترفين",
    nameEn: "Monthly Master",
    descAr: "حافظت على ستريك 30 يوماً بلا انقطاع",
    descEn: "Kept a 30-day streak unbroken",
    icon: "🌟",
    condition: "streak >= 30",
    xpReward: 300,
  },
  {
    id: "first_win_bot",
    nameAr: "مستكشف المختبر",
    nameEn: "Lab Explorer",
    descAr: "أكملت أول جلسة داخل مختبر السايبر",
    descEn: "Completed your first Cyber Lab session",
    icon: "🧪",
    condition: "labSessions >= 1",
    xpReward: 40,
  },
  {
    id: "puzzles_10",
    nameAr: "صيّاد التحديات",
    nameEn: "Challenge Hunter",
    descAr: "حللت 10 تحديات يومية بنجاح",
    descEn: "Solved 10 daily challenges",
    icon: "🎯",
    condition: "challengesSolved >= 10",
    xpReward: 100,
  },
  {
    id: "first_checkmate",
    nameAr: "الفلاج الأول!",
    nameEn: "First Flag!",
    descAr: "التقطت أول Flag صحيح في تحدي",
    descEn: "Captured your first correct flag",
    icon: "🏁",
    condition: "challengesSolved >= 1",
    xpReward: 50,
  },
  {
    id: "marathon_day",
    nameAr: "ماراثون السايبر",
    nameEn: "Cyber Marathon",
    descAr: "جمعت 300 نقطة XP في رحلتك التعليمية",
    descEn: "Racked up 300 XP on your learning journey",
    icon: "🏃",
    condition: "xp >= 300",
    xpReward: 80,
  },
  {
    id: "top_10_leaderboard",
    nameAr: "نادي النخبة",
    nameEn: "Top 10 Elite",
    descAr: "وصلت إلى 1000 نقطة XP وتقدمت نحو القمة",
    descEn: "Reached 1000 XP and climbed toward the top",
    icon: "🏆",
    condition: "xp >= 1000",
    xpReward: 150,
  },
  {
    id: "course_completed",
    nameAr: "أسطورة الأمن السيبراني",
    nameEn: "Cyber Security Legend",
    descAr: "أكملت جميع دروس المسار وحصلت على الشهادة",
    descEn: "Completed all roadmap lessons and earned the certificate",
    icon: "🎓",
    condition: "allLessonsDone",
    xpReward: 500,
  },
];

export const XP_RULES = {
  LESSON_COMPLETE: 50,
  QUIZ_PERFECT_BONUS: 10,
  DAILY_CHALLENGE: 30,
  LAB_SESSION: 20,
  LAB_DAILY_LIMIT: 3,
  LEVEL_COMPLETE: 100,
};
