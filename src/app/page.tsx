"use client";

import React, { useState } from "react";
import SurveyForm from "@/components/SurveyForm";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck, Award, Globe } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

export default function Home() {
  const [lang, setLang] = useState<Language>("tg");
  const t = TRANSLATIONS[lang];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-100 via-emerald-50/25 to-slate-100 selection:bg-emerald-600 selection:text-white">
      {/* Official Government Header (Unified Top Bar) */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Logo & Full Official Ministry / Enterprise Titles */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            {/* Logo card */}
            <div className="relative w-12 h-14 sm:w-14 sm:h-16 bg-white rounded-xl p-1 shadow-xs border border-emerald-100 flex items-center justify-center shrink-0">
              <Image
                src="/logo.png"
                alt={t.enterprise}
                width={56}
                height={64}
                priority
                className="object-contain w-full h-full select-none"
              />
            </div>

            {/* Ministry and Enterprise Titles */}
            <div className="flex flex-col min-w-0">
              <p className="text-[11px] sm:text-xs font-extrabold uppercase text-emerald-800 tracking-wide leading-tight truncate">
                {t.ministry}
              </p>
              <h2 className="text-[10px] sm:text-xs font-semibold text-slate-700 leading-snug line-clamp-2 mt-0.5">
                {t.enterprise}
              </h2>
            </div>
          </div>

          {/* Right: Language Switcher & System Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Live Status Pill */}
            <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>{t.topBarLiveStatus}</span>
            </div>

            {/* Language Switcher */}
            <div className="inline-flex items-center gap-1 p-1 bg-slate-100/95 rounded-xl border border-slate-200/90 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 hidden xs:block" />
              <button
                type="button"
                onClick={() => setLang("tg")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  lang === "tg"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Тоҷикӣ
              </button>
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  lang === "ru"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Русский
              </button>
            </div>
          </div>
        </div>

        {/* Elegant 2px bottom accent hairline */}
        <div className="h-[2px] w-full bg-gradient-to-r from-red-600 via-amber-400 to-emerald-600 opacity-85" />
      </header>

      <div className="flex-1">
        <SurveyForm lang={lang} onLangChange={setLang} />
      </div>

      {/* Unified Official Enterprise Footer */}
      <footer className="border-t border-slate-200/80 bg-white/95 backdrop-blur-xs py-10 mt-6 sm:mt-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Integrated Contact Cards (Light Government Theme) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {/* EMAIL */}
            <a
              href="mailto:info@agridigital.tj"
              className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition duration-200 shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-700 transition">
                <Mail className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 block uppercase group-hover:text-emerald-800 transition">
                  {t.contactEmail}
                </span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 transition truncate block">
                  info@agridigital.tj
                </span>
              </div>
            </a>

            {/* ТЕЛЕФОНИ БОВАРӢ / ТЕЛЕФОН ДОВЕРИЯ */}
            <a
              href="tel:+992372319090"
              className="group flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/80 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-emerald-300 transition duration-200 shadow-xs"
            >
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 group-hover:border-emerald-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-700 transition">
                <Phone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 block uppercase group-hover:text-emerald-800 transition">
                  {t.contactPhone}
                </span>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-emerald-900 transition block">
                  +992 37 231 90 90
                </span>
              </div>
            </a>

            {/* СУРОҒА / АДРЕС */}
            <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 shadow-xs">
              <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-xs text-emerald-700">
                <MapPin className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wider text-slate-500 block uppercase">
                  {t.contactAddress}
                </span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 leading-snug block">
                  {t.addressValue}
                </span>
              </div>
            </div>
          </div>

          {/* Official Enterprise Credentials & Logo */}
          <div className="pt-6 border-t border-slate-100 flex flex-col lg:flex-row items-center lg:items-start justify-between gap-6 text-center lg:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
              <div className="relative w-16 h-20 bg-white rounded-2xl p-1.5 shadow-xs border border-emerald-100 shrink-0">
                <Image
                  src="/logo.png"
                  alt={t.enterprise}
                  width={64}
                  height={80}
                  className="object-contain w-full h-full"
                />
              </div>

              <div className="space-y-1 text-xs text-left">
                <p className="font-bold text-slate-900 text-xs sm:text-sm leading-snug">
                  {t.enterprise}
                </p>
                <p className="text-[11px] sm:text-xs text-emerald-900 font-semibold leading-snug">
                  {t.ministry}
                </p>
              </div>
            </div>

            {/* Badges & Status */}
            <div className="flex flex-col items-center lg:items-end gap-2 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5 font-medium text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {t.supportBadge}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                {t.govBadge}
              </span>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
            <p>
              © {new Date().getFullYear()} {t.copyright}
            </p>
            <p className="text-slate-400">
              {t.confidential}
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
