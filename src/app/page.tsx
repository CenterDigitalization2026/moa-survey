"use client";

import React, { useState } from "react";
import SurveyForm from "@/components/SurveyForm";
import Image from "next/image";
import { Mail, Phone, MapPin, ShieldCheck, Award } from "lucide-react";
import { Language, TRANSLATIONS } from "@/lib/translations";

export default function Home() {
  const [lang, setLang] = useState<Language>("tg");
  const t = TRANSLATIONS[lang];

  return (
    <main className="min-h-screen flex flex-col justify-between bg-gradient-to-b from-slate-100 via-emerald-50/25 to-slate-100 selection:bg-emerald-600 selection:text-white">
      {/* Top National Ribbon */}
      <div className="w-full h-1.5 flex shadow-xs">
        <div className="flex-1 bg-red-600" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-emerald-600" />
      </div>

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
