"use client";

import React, { useRef } from "react";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/common/Button";
import { CyberIcon } from "@/components/common/CyberIcon";
import {
  Printer,
  ShieldCheck,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function CertificatePage() {
  const { t, locale } = useTranslation();
  const { user } = useAuth();
  const certRef = useRef<HTMLDivElement>(null);

  const certId = "CSEC-2026-8921";
  const studentName = user?.displayName || "بطل الأمن السيبراني";
  const [issueDate, setIssueDate] = React.useState("12 أكتوبر 2026");

  React.useEffect(() => {
    // The formatted date depends on the active locale and is computed on the
    // client to avoid a server/client timezone mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIssueDate(
      new Date().toLocaleDateString(locale === "ar" ? "ar-EG" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, [locale]);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF6EC]">
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Actions Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b-2 border-gray-300">
          <div>
            <Badge variant="yellow" size="md" className="mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0A0A0A]" />
              <span>{t("certificate.cert_badge")}</span>
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0A0A0A]">
              {t("certificate.title")}
            </h1>
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer className="w-4 h-4" />}
            >
              {t("certificate.download_pdf")}
            </Button>
            <Button
              href={`/verify/${certId}`}
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-4 h-4" />}
            >
              صفحة التحقق ➔
            </Button>
          </div>
        </div>

        {/* =============================================== */}
        {/* THE NEO-BRUTALISM OFFICIAL CERTIFICATE          */}
        {/* =============================================== */}
        <div
          ref={certRef}
          className="relative bg-[#FAF6EC] border-[6px] border-[#0A0A0A] shadow-[12px_12px_0px_#0A0A0A] p-8 sm:p-14 select-none overflow-hidden my-4"
        >
          {/* Inner Grid Border Accent */}
          <div className="absolute inset-3 border-2 border-dashed border-[#0A0A0A] pointer-events-none" />

          {/* Certificate Corner Cyber Icons */}
          <div className="absolute top-6 start-6">
            <CyberIcon name="terminal" size={28} />
          </div>
          <div className="absolute top-6 end-6">
            <CyberIcon name="terminal" size={28} />
          </div>
          <div className="absolute bottom-6 start-6">
            <CyberIcon name="shield" size={28} />
          </div>
          <div className="absolute bottom-6 end-6">
            <CyberIcon name="shield" size={28} />
          </div>

          {/* Certificate Content */}
          <div className="text-center relative z-10 space-y-6">
            {/* Seal & Logo */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FACC15] border-[3px] border-[#0A0A0A] shadow-[4px_4px_0px_#0A0A0A] mb-2">
              <CyberIcon name="crown" size={44} />
            </div>

            <div className="space-y-1">
              <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#3346F0]">
                Learn Cyber Security • منصة الأمن السيبراني
              </span>
              <h2 className="text-3xl sm:text-5xl font-black text-[#0A0A0A] tracking-tight">
                {t("certificate.title")}
              </h2>
            </div>

            <p className="text-xs sm:text-sm font-bold text-gray-700 max-w-lg mx-auto">
              {t("certificate.awarded_to")}
            </p>

            {/* Recipient Student Name */}
            <div className="py-2">
              <span className="inline-block text-3xl sm:text-6xl font-black text-[#0A0A0A] border-b-4 border-[#0A0A0A] pb-2 px-6">
                {studentName}
              </span>
            </div>

            {/* Reason text */}
            <p className="text-xs sm:text-base font-bold text-gray-800 max-w-2xl mx-auto leading-relaxed">
              {t("certificate.reason")}
            </p>

            {/* Verification and Date Section */}
            <div className="pt-8 mt-6 border-t-2 border-[#0A0A0A] grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Date */}
              <div className="text-start sm:text-start">
                <p className="text-[10px] font-black uppercase text-gray-500">
                  {t("certificate.issue_date")}
                </p>
                <p className="text-sm font-black text-[#0A0A0A] mt-0.5">{issueDate}</p>
              </div>

              {/* Verified Platform Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-[3px] border-[#0A0A0A] bg-[#FACC15] shadow-[3px_3px_0px_#0A0A0A] flex flex-col items-center justify-center">
                  <ShieldCheck className="w-7 h-7 text-[#0A0A0A]" />
                  <span className="text-[8px] font-black uppercase">معتمد 100%</span>
                </div>
              </div>

              {/* Code */}
              <div className="text-end sm:text-end">
                <p className="text-[10px] font-black uppercase text-gray-500">
                  {t("certificate.verification_code")}
                </p>
                <p className="text-xs sm:text-sm font-mono font-black text-[#3346F0] bg-white px-2 py-1 border border-[#0A0A0A] inline-block mt-0.5">
                  {certId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
