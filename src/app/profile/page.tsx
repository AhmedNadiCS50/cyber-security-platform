"use client";

import React, { useState } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon, AVATAR_OPTIONS } from "@/components/common/CyberIcon";
import { BADGES, getRankByXp, getNextRank } from "@/lib/xpRules";
import {
  Lock,
  CheckCircle2,
  Edit2,
  Save,
} from "lucide-react";

export default function ProfilePage() {
  const { t, locale } = useTranslation();
  const { user, updateUserProfile } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || "متعلم جديد");
  const [country, setCountry] = useState(user?.country || "مصر");
  const [avatar, setAvatar] = useState<string>(user?.avatar || "shield");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const xp = user?.xp ?? 0;
  const streak = user?.streak ?? 0;
  const currentRank = getRankByXp(xp);
  const { nextRank, xpNeeded, progressPercent } = getNextRank(xp);

  const rankName = (r: { nameAr: string; nameEn: string }) =>
    locale === "ar" ? r.nameAr : r.nameEn;

  // User unlocked badges (default to first_lesson if not specified)
  const userBadges = user?.badges || ["first_lesson"];

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateUserProfile({
      displayName,
      country,
      avatar,
    });
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
        {/* Header Title */}
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0A0A0A]">
            <HandDrawnUnderline>{t("nav.profile")}</HandDrawnUnderline>
          </h1>
          <p className="text-xs sm:text-sm font-bold text-gray-700 mt-1">
            إدارة حسابك، رتبتك، ومتابعة الشارات الـ {BADGES.length} المتاحة.
          </p>
        </div>

        {/* Profile Card & Rank Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* User Details Card */}
          <Card
            variant="white"
            className="lg:col-span-5 p-6 sm:p-8 shadow-[6px_6px_0px_#0A0A0A]"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b-2 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-[#FACC15] border-[3px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center">
                  <CyberIcon name={avatar} size={38} />
                </div>
                <div>
                  <h3 className="font-black text-xl text-[#0A0A0A]">{user?.displayName || displayName}</h3>
                  <p className="text-xs font-bold text-[#3346F0]">{rankName(currentRank)} • {xp} XP</p>
                </div>
              </div>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 bg-[#FAF6EC] hover:bg-[#FACC15] border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer"
                title={locale === "ar" ? "تعديل البيانات" : "Edit profile"}
              >
                <Edit2 className="w-4 h-4 text-[#0A0A0A]" />
              </button>
            </div>

            {savedSuccess && (
              <div className="mb-4 p-2.5 bg-green-100 border-2 border-green-700 text-green-900 font-bold text-xs flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>تم حفظ التعديلات بنجاح!</span>
              </div>
            )}

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#0A0A0A] mb-1">اسم العرض</label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0A0A0A] mb-1">البلد</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full p-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-[#0A0A0A] mb-1">تغيير الأفاتار</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                    {AVATAR_OPTIONS.map((avatarId) => (
                      <button
                        key={avatarId}
                        type="button"
                        onClick={() => setAvatar(avatarId)}
                        className={`p-1.5 border-2 flex items-center justify-center cursor-pointer ${
                          avatar === avatarId
                            ? "bg-[#FACC15] border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                            : "bg-[#FAF6EC] border-gray-300 hover:bg-white"
                        }`}
                      >
                        <CyberIcon name={avatarId} size={22} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" variant="primary" size="sm" className="flex-1" icon={<Save className="w-4 h-4" />}>
                    حفظ التغييرات
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    إلغاء
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3 text-xs font-bold text-gray-700">
                <div className="flex justify-between p-2.5 bg-[#FAF6EC] border border-[#0A0A0A]">
                  <span className="text-gray-500">البريد الإلكتروني:</span>
                  <span className="font-extrabold text-[#0A0A0A]">{user?.email || "غير محدد"}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-[#FAF6EC] border border-[#0A0A0A]">
                  <span className="text-gray-500">البلد:</span>
                  <span className="font-extrabold text-[#0A0A0A]">{user?.country || country || "غير محدد"}</span>
                </div>
                <div className="flex justify-between p-2.5 bg-[#FAF6EC] border border-[#0A0A0A]">
                  <span className="text-gray-500">الستريك النشط:</span>
                  <span className="font-extrabold text-[#FF6B00]">{streak} أيام متتالية 🔥</span>
                </div>
                <div className="flex justify-between p-2.5 bg-[#FAF6EC] border border-[#0A0A0A]">
                  <span className="text-gray-500">نوع الحساب:</span>
                  <span className="font-extrabold text-[#3346F0]">{user?.role === "owner" ? "مالك المنصة" : "متعلم"}</span>
                </div>
              </div>
            )}
          </Card>

          {/* Rank Progress Info */}
          <Card
            variant="cream"
            className="lg:col-span-7 p-6 sm:p-8 shadow-[6px_6px_0px_#0A0A0A] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black text-xl text-[#0A0A0A]">نظام الرتب والتصنيف</h3>
                <Badge variant="yellow" size="sm">
                  {xp} XP الإجمالي
                </Badge>
              </div>

              <p className="text-xs sm:text-sm font-bold text-gray-700 leading-relaxed mb-6">
                تتدرج الرتب من <span className="font-black">مستكشف</span> إلى <span className="font-black">أسطورة الأمن السيبراني</span>. كلما أكملت دروساً أكثر وحللت تحديات يومية ترتقي للمستوى التالي وتفتح شارات حصرية!
              </p>

              {/* Progress bar to next rank */}
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-xs font-black text-[#0A0A0A]">
                  <span>{rankName(currentRank)}</span>
                  <span>{nextRank ? `${rankName(nextRank)} (متبقي ${xpNeeded} XP)` : "القمة 👑"}</span>
                </div>
                <div className="w-full bg-white h-4 border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]">
                  <div className="bg-[#3346F0] h-full" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Quick Link to Learn */}
            <div className="pt-4 border-t-2 border-[#0A0A0A]/20 flex justify-end">
              <Button href="/learn" variant="primary" size="md">
                متابعة المسار التعليمي ➔
              </Button>
            </div>
          </Card>
        </div>

        {/* =============================================== */}
        {/* ACHIEVEMENT BADGES SECTION                      */}
        {/* =============================================== */}
        <div>
          <div className="flex items-center justify-between mb-6 pb-2 border-b-2 border-gray-300">
            <div>
              <h2 className="text-2xl font-black text-[#0A0A0A]">
                الشارات والإنجازات ({BADGES.length} شارة)
              </h2>
              <p className="text-xs font-bold text-gray-600 mt-0.5">
                حصلت على {userBadges.length} من أصل {BADGES.length} شارة حتى الآن.
              </p>
            </div>
            <span className="font-black text-sm text-[#FF6B00]">
              {Math.round((userBadges.length / BADGES.length) * 100)}% مكتمل
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {BADGES.map((badge) => {
              const isUnlocked = userBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`p-4 border-[2.5px] border-[#0A0A0A] transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-white shadow-[4px_4px_0px_#0A0A0A] hover:-translate-y-1"
                      : "bg-[#E8E8E8] opacity-60 shadow-[2px_2px_0px_#0A0A0A]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{badge.icon}</span>
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 bg-[#FACC15] text-[#0A0A0A] font-black text-[10px] border border-[#0A0A0A]">
                          ✓ مفتوحة
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-black text-gray-600 bg-white px-2 py-0.5 border border-gray-400">
                          <Lock className="w-3 h-3" /> مقفولة
                        </span>
                      )}
                    </div>

                    <h4 className="font-black text-base text-[#0A0A0A] mb-1">
                      {locale === "ar" ? badge.nameAr : badge.nameEn}
                    </h4>
                    <p className="text-xs font-bold text-gray-700 leading-snug">
                      {locale === "ar" ? badge.descAr : badge.descEn}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-gray-300 flex items-center justify-between text-[11px] font-black text-[#3346F0]">
                    <span>مكافأة الشارة:</span>
                    <span>+{badge.xpReward} XP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
