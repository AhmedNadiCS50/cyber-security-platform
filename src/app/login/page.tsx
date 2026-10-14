"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { HandDrawnUnderline } from "@/components/common/HandDrawnUnderline";
import { CyberIcon } from "@/components/common/CyberIcon";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Mail, Lock, AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { t, dir } = useTranslation();
  const { loginWithEmail, loginWithGoogle, user } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg(t("auth.error_generic"));
      return;
    }

    setIsLoading(true);
    const res = await loginWithEmail(email, password);
    setIsLoading(false);

    if (res.success) {
      if (user && !user.onboardingDone) {
        router.push("/onboarding");
      } else {
        router.push("/learn");
      }
    } else {
      if (res.error?.includes("user-not-found") || res.error?.includes("wrong-password") || res.error?.includes("invalid-credential")) {
        setErrorMsg(t("auth.error_wrong_cred"));
      } else if (res.error?.includes("invalid-email")) {
        setErrorMsg(t("auth.error_invalid_email"));
      } else {
        setErrorMsg(res.error || t("auth.error_wrong_cred"));
      }
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const res = await loginWithGoogle();
    setIsLoading(false);
    if (res.success) {
      if (user && !user.onboardingDone) {
        router.push("/onboarding");
      } else {
        router.push("/learn");
      }
    } else {
      setErrorMsg(res.error || t("auth.error_generic"));
    }
  };

  const ArrowIcon = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6">
        <div className="w-full max-w-md">
          {/* Header Title */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-[#3346F0] text-white border-[3px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] mb-3">
              <CyberIcon name="terminal" size={32} color="#FFFFFF" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A0A0A]">
              <HandDrawnUnderline>{t("auth.login_title")}</HandDrawnUnderline>
            </h1>
            <p className="text-xs sm:text-sm font-bold text-gray-700 mt-2">
              {t("auth.login_subtitle")}
            </p>
          </div>

          <Card variant="white" borderWidth="3px" className="shadow-[6px_6px_0px_#0A0A0A]">
            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border-[2.5px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] font-extrabold text-sm text-[#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#0A0A0A] transition-all cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{t("auth.google_btn")}</span>
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-1 border-t-2 border-[#0A0A0A]" />
              <span className="px-3 text-xs font-black uppercase text-[#0A0A0A]">
                {t("auth.or_divider")}
              </span>
              <div className="flex-1 border-t-2 border-[#0A0A0A]" />
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-3 bg-red-100 border-2 border-red-600 shadow-[2px_2px_0px_#DC2626] flex items-center gap-2 text-xs font-bold text-red-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1">
                  {t("auth.email_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-gray-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("auth.email_placeholder")}
                    className="w-full ps-9 pe-3 py-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm focus:outline-none focus:bg-[#FAF6EC] focus:border-[#3346F0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#0A0A0A] uppercase tracking-wider mb-1">
                  {t("auth.password_label")}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none text-gray-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("auth.password_placeholder")}
                    className="w-full ps-9 pe-3 py-2.5 bg-white border-2 border-[#0A0A0A] font-bold text-sm focus:outline-none focus:bg-[#FAF6EC] focus:border-[#3346F0]"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isLoading}
                className="w-full mt-2 font-black"
                icon={<ArrowIcon className="w-5 h-5" />}
                iconPosition="end"
              >
                {isLoading ? "..." : t("auth.login_btn")}
              </Button>
            </form>

            <div className="mt-6 text-center text-xs font-bold text-[#0A0A0A] pt-4 border-t border-gray-200">
              <span>{t("auth.no_account")} </span>
              <Link
                href="/signup"
                className="text-[#3346F0] underline font-black hover:text-[#0A0A0A]"
              >
                {t("auth.register_here")}
              </Link>
            </div>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
