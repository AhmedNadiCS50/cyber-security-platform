"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "@/context/LanguageContext";
import { CyberIcon } from "./CyberIcon";
import { Shield, Sparkles, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full bg-[#0A0A0A] text-white border-t-[4px] border-[#0A0A0A] relative overflow-hidden select-none">
      {/* Top checkered accent strip */}
      <div className="h-2 w-full bg-[#FACC15] border-b-2 border-black" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#FACC15] border-2 border-white flex items-center justify-center shadow-[3px_3px_0px_#FFFFFF]">
                <CyberIcon name="shield" size={24} color="#0A0A0A" />
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                {t("brand.name")}
              </span>
            </div>

            <p className="text-sm sm:text-base text-gray-300 max-w-md leading-relaxed">
              {t("footer.about")}
            </p>

            <div className="p-3 bg-[#FAF6EC]/10 border-2 border-[#FACC15] inline-flex items-center gap-2 text-xs text-[#FACC15] font-bold">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{t("hero.badge")}</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="font-black text-base text-[#FACC15] uppercase tracking-wider border-b-2 border-gray-800 pb-1">
              {t("footer.quick_links")}
            </h4>
            <ul className="space-y-2 text-sm font-bold text-gray-300">
              <li>
                <Link href="/learn" className="hover:text-[#FACC15] transition-colors">
                  {t("nav.learn")}
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-[#FACC15] transition-colors">
                  {t("nav.leaderboard")}
                </Link>
              </li>
              <li>
                <Link href="/challenges" className="hover:text-[#FACC15] transition-colors">
                  {t("nav.challenges")}
                </Link>
              </li>
              <li>
                <Link href="/lab" className="hover:text-[#FACC15] transition-colors">
                  {t("nav.lab")}
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#FACC15] transition-colors">
                  {t("nav.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Safety */}
          <div className="space-y-3">
            <h4 className="font-black text-base text-[#FACC15] uppercase tracking-wider border-b-2 border-gray-800 pb-1">
              {t("footer.legal")}
            </h4>
            <ul className="space-y-2 text-sm font-bold text-gray-300">
              <li>
                <Link href="/privacy" className="hover:text-[#FACC15] transition-colors">
                  {t("footer.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#FACC15] transition-colors">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>

            <div className="p-3 bg-[#262626] border border-gray-700 text-xs text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-white">
                <Shield className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>أمان وخصوصية</span>
              </div>
              <p>{t("footer.age_notice")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-bold text-gray-400">
          <p>© 2026 {t("footer.rights")}</p>
          <p className="flex items-center gap-1">
            صُنعت بشغف لمجتمع الأمن السيبراني العربي <Heart className="w-3.5 h-3.5 fill-[#FF6B00] text-[#FF6B00]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
