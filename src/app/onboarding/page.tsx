"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon, AVATAR_OPTIONS } from "@/components/common/CyberIcon";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Sparkles, ShieldCheck, Check, ArrowLeft, ArrowRight, User } from "lucide-react";

export default function OnboardingPage() {
  const { t, dir } = useTranslation();
  const { user, completeOnboarding } = useAuth();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [age, setAge] = useState("19-30");
  const [level, setLevel] = useState("beginner");
  const [avatar, setAvatar] = useState<string>("shield");
  const [country, setCountry] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      setErrorMsg("يرجى إدخال اسم العرض أولاً!");
      return;
    }

    setIsLoading(true);
    await completeOnboarding({
      displayName: displayName.trim(),
      age,
      level,
      avatar,
      country: country.trim(),
    });
    setIsLoading(false);

    // Direct redirect to /learn as explicitly requested in requirements
    router.push("/learn");
  };

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-10 px-4 sm:px-6">
        <div className="w-full max-w-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <Badge variant="yellow" size="md" className="mb-2">
              <Sparkles className="w-4 h-4 text-[#0A0A0A]" />
              <span>{t("onboarding.step_progress")}</span>
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-black text-[#0A0A0A]">
              <HandDrawnUnderline>{t("onboarding.title")}</HandDrawnUnderline>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2">
              {t("onboarding.subtitle")}
            </p>
          </div>

          <Card variant="white" borderWidth="3px" className="shadow-[8px_8px_0px_#0A0A0A] p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  1. {t("onboarding.name_label")} <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-gray-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => {
                      setDisplayName(e.target.value);
                      setErrorMsg("");
                    }}
                    placeholder={t("onboarding.name_placeholder")}
                    className="w-full ps-9 pe-3 py-3 bg-white border-2 border-[#0A0A0A] font-extrabold text-sm focus:outline-none focus:bg-[#FAF6EC] focus:border-[#3346F0]"
                  />
                </div>
                {errorMsg && (
                  <p className="text-xs font-bold text-red-600 mt-1">{errorMsg}</p>
                )}
              </div>

              {/* Avatar Selection */}
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  2. {t("onboarding.avatar_label")}
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                  {AVATAR_OPTIONS.map((avatarId) => {
                    const isSelected = avatar === avatarId;
                    return (
                      <button
                        key={avatarId}
                        type="button"
                        onClick={() => setAvatar(avatarId)}
                        className={`aspect-square flex flex-col items-center justify-center p-2 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FACC15] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] -translate-y-1"
                            : "bg-[#FAF6EC] border-[#0A0A0A] hover:bg-white shadow-[2px_2px_0px_#0A0A0A]"
                        }`}
                      >
                        <CyberIcon name={avatarId} size={28} />
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-[#0A0A0A] mt-1" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  3. {t("onboarding.level_label")}
                </label>
                <div className="space-y-2">
                  {[
                    { id: "beginner", text: t("onboarding.level_beginner"), badge: "0 XP" },
                    { id: "basics", text: t("onboarding.level_basics"), badge: "+100" },
                    { id: "advanced", text: t("onboarding.level_advanced"), badge: "+300" },
                  ].map((item) => {
                    const isSelected = level === item.id;
                    return (
                      <label
                        key={item.id}
                        onClick={() => setLevel(item.id)}
                        className={`flex items-center justify-between p-3 border-2 transition-all cursor-pointer select-none ${
                          isSelected
                            ? "bg-[#3346F0] text-white border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
                            : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FAF6EC]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-5 h-5 border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-white bg-[#FACC15] text-[#0A0A0A]"
                                : "border-[#0A0A0A] bg-white"
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                          <span className="text-xs sm:text-sm font-extrabold">{item.text}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Age Bracket & Child Notice */}
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  4. {t("onboarding.age_label")}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: "<13", label: t("onboarding.age_child") },
                    { id: "13-18", label: t("onboarding.age_teen") },
                    { id: "19-30", label: t("onboarding.age_young") },
                    { id: "30+", label: t("onboarding.age_adult") },
                  ].map((item) => {
                    const isSelected = age === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setAge(item.id)}
                        className={`p-2.5 text-center text-xs font-extrabold border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#FACC15] text-[#0A0A0A] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A]"
                            : "bg-white text-[#0A0A0A] border-[#0A0A0A] hover:bg-[#FAF6EC]"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                {age === "<13" && (
                  <div className="mt-2.5 p-2.5 bg-yellow-50 border-2 border-[#FACC15] text-xs font-bold text-gray-800 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#FF6B00] shrink-0 mt-0.5" />
                    <span>{t("onboarding.age_warning")}</span>
                  </div>
                )}
              </div>

              {/* Country (Optional) */}
              <div>
                <label className="block text-xs font-black text-[#0A0A0A] uppercase tracking-wider mb-2">
                  5. {t("onboarding.country_label")}
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder={t("onboarding.country_placeholder")}
                  className="w-full px-3.5 py-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm focus:outline-none focus:bg-[#FAF6EC] focus:border-[#3346F0]"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full py-4 text-base sm:text-lg font-black"
                icon={<ArrowIcon className="w-5 h-5" />}
                iconPosition="end"
              >
                {isLoading ? "..." : t("onboarding.finish_btn")}
              </Button>
            </form>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
