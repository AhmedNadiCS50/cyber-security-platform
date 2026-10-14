"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./Button";
import { CyberIcon, type CyberIconName } from "./CyberIcon";
import { Globe, Menu, X, Flame, ShieldAlert, User, LogOut, LayoutDashboard } from "lucide-react";

export const Navbar: React.FC = () => {
  const { t, locale, toggleLocale } = useTranslation();
  const { user, isOwner, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/learn", label: t("nav.learn") },
    { href: "/leaderboard", label: t("nav.leaderboard") },
    { href: "/#faq", label: t("nav.faq") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#FAF6EC] border-b-[3px] border-[#0A0A0A] select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus:outline-none"
        >
          <div className="w-11 h-11 bg-[#FACC15] border-[2.5px] border-[#0A0A0A] shadow-[3px_3px_0px_#0A0A0A] flex items-center justify-center transition-transform group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:shadow-[5px_5px_0px_#0A0A0A]">
            <CyberIcon name="terminal" size={26} color="#0A0A0A" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-xl tracking-tight text-[#0A0A0A] leading-none">
              {t("brand.name")}
            </span>
            <span className="text-[10px] font-bold text-[#3346F0] tracking-wider uppercase mt-0.5">
              {t("brand.sub")}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 font-extrabold text-sm border-2 transition-all ${
                  isActive
                    ? "bg-[#0A0A0A] text-white border-[#0A0A0A] shadow-[2px_2px_0px_#FACC15]"
                    : "border-transparent hover:border-[#0A0A0A] hover:bg-white text-[#0A0A0A] hover:shadow-[2px_2px_0px_#0A0A0A]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Switcher */}
          <button
            onClick={toggleLocale}
            className="flex items-center gap-1.5 px-2.5 py-1.5 font-black text-xs sm:text-sm bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all cursor-pointer"
            title={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
          >
            <Globe className="w-4 h-4 text-[#3346F0]" />
            <span>{locale === "ar" ? "EN" : "عربي"}</span>
          </button>

          {/* User Profile or Login Buttons */}
          {user ? (
            <div className="relative">
              <div className="flex items-center gap-2">
                {/* Streak Badge */}
                <div
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#FF6B00] text-white font-black text-xs border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                  title={`${user.streak} ${t("nav.streak")}`}
                >
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{user.streak}</span>
                </div>

                {/* XP Badge */}
                <div
                  className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-[#FACC15] text-[#0A0A0A] font-black text-xs border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A]"
                  title={`${user.xp} ${t("nav.xp")}`}
                >
                  <span>{user.xp} XP</span>
                </div>

                {/* User Avatar Button */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_#0A0A0A] transition-all cursor-pointer"
                >
                  <div className="w-7 h-7 bg-[#FACC15] border border-[#0A0A0A] flex items-center justify-center font-black text-xs">
                    <CyberIcon name={(user.avatar as CyberIconName) || "shield"} size={18} />
                  </div>
                  <span className="font-extrabold text-xs sm:text-sm max-w-[100px] truncate hidden md:inline-block">
                    {user.displayName || "المتعلم"}
                  </span>
                </button>
              </div>

              {/* Dropdown Menu */}
              {userDropdownOpen && (
                <div className="absolute end-0 mt-2 w-56 bg-white border-[2.5px] border-[#0A0A0A] shadow-[5px_5px_0px_#0A0A0A] p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="p-2 border-b-2 border-[#0A0A0A] mb-2 bg-[#FAF6EC]">
                    <p className="font-black text-sm text-[#0A0A0A] truncate">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs font-bold text-[#3346F0]">
                      {user.rank || "مستكشف"} • {user.xp} XP
                    </p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-[#FACC15] border border-transparent hover:border-[#0A0A0A] mb-1"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>{t("nav.dashboard")}</span>
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-bold hover:bg-[#FACC15] border border-transparent hover:border-[#0A0A0A] mb-1"
                  >
                    <User className="w-4 h-4" />
                    <span>{t("nav.profile")}</span>
                  </Link>

                  {isOwner && (
                    <Link
                      href="/admin"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-bold bg-[#3346F0] text-white hover:bg-[#2535C5] border border-[#0A0A0A] mb-1"
                    >
                      <ShieldAlert className="w-4 h-4" />
                      <span>{t("nav.admin")}</span>
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 border border-transparent hover:border-red-600 text-start cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t("nav.logout")}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button href="/login" variant="outline" size="sm" className="hidden sm:inline-flex">
                {t("nav.login")}
              </Button>
              <Button href="/signup" variant="primary" size="sm">
                {t("nav.signup")}
              </Button>
            </div>
          )}

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] cursor-pointer"
            aria-label="القائمة"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF6EC] border-t-2 border-[#0A0A0A] p-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 font-bold text-sm bg-white border-2 border-[#0A0A0A] shadow-[2px_2px_0px_#0A0A0A] hover:bg-[#FACC15]"
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <div className="flex gap-2 pt-2 border-t-2 border-[#0A0A0A]">
              <Button
                href="/login"
                variant="outline"
                size="md"
                className="flex-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.login")}
              </Button>
              <Button
                href="/signup"
                variant="primary"
                size="md"
                className="flex-1"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("nav.signup")}
              </Button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
