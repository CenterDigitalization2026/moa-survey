"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Monitor,
  Camera,
  Mic,
  Volume2,
  Tv,
  Wifi,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Building2,
  User,
  Phone,
  Radio,
  Sliders,
  Send,
  HelpCircle,
  Layers,
  Headphones,
  SignalHigh,
  Globe,
  UserCheck,
  Pin,
  CornerDownLeft,
  PhoneCall,
  RotateCcw,
  Sparkles
} from "lucide-react";
import { TAJIKISTAN_REGIONS_TG, TAJIKISTAN_REGIONS_RU } from "@/lib/regions";
import { SurveyFormData, SurveySchema } from "@/lib/survey-schema";
import { submitSurvey } from "@/app/actions/survey";
import { Language, TRANSLATIONS } from "@/lib/translations";
import { generateDefaultOrganization } from "@/lib/auto-org";

const PLATFORM_LIST = [
  { id: "Zoom", name: "Zoom" },
  { id: "Google Meet", name: "Google Meet" },
  { id: "TrueConf", name: "TrueConf" },
  { id: "Telegram", name: "Telegram" },
  { id: "Skype", name: "Skype" }
];

interface SurveyFormProps {
  lang: Language;
  onLangChange?: (lang: Language) => void;
}

export default function SurveyForm({ lang }: SurveyFormProps) {
  const t = TRANSLATIONS[lang];
  const regionsData = lang === "tg" ? TAJIKISTAN_REGIONS_TG : TAJIKISTAN_REGIONS_RU;

  const [operatorName, setOperatorName] = useState<string>("");
  const [keepRegion, setKeepRegion] = useState<boolean>(true);
  const [callsCount, setCallsCount] = useState<number>(0);
  const [lastSavedToast, setLastSavedToast] = useState<{ id: number; district: string; status: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOtherProvider, setIsOtherProvider] = useState<boolean>(false);
  const [customProvider, setCustomProvider] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm<SurveyFormData>({
    resolver: zodResolver(SurveySchema),
    defaultValues: {
      operatorName: "",
      callStatus: lang === "tg" ? "Тамос гирифта шуд (Бомуваффақият)" : "Дозвонились (Успешно)",
      region: "",
      district: "",
      organization: "",
      fullName: "",
      position: "",
      phone: "",
      hasMessenger: false,
      hasPc: "",
      cameraStatus: "",
      micStatus: "",
      audioOutput: "",
      hasDisplay: "",
      internetType: "",
      provider: "",
      internetQuality: "",
      platforms: ["Zoom"],
      needsTest: false,
      comments: ""
    }
  });

  const selectedRegion = watch("region");
  const selectedDistrict = watch("district");
  const currentOrgValue = watch("organization");
  const callStatus = watch("callStatus");
  const selectedPc = watch("hasPc");
  const selectedCamera = watch("cameraStatus");
  const selectedMic = watch("micStatus");
  const selectedAudio = watch("audioOutput");
  const selectedDisplay = watch("hasDisplay");
  const selectedInternetType = watch("internetType");
  const selectedProvider = watch("provider");
  const selectedQuality = watch("internetQuality");

  const isCallSuccessful =
    callStatus === "Дозвонились (Успешно)" ||
    callStatus === "Тамос гирифта шуд (Бомуваффақият)" ||
    callStatus === "answered";

  const availableDistricts = selectedRegion ? regionsData[selectedRegion] || [] : [];

  // Helper for localStorage daily calls key
  const getTodayCallsKey = () => {
    const today = new Date().toISOString().slice(0, 10);
    return `moa_calls_count_${today}`;
  };

  // Synchronize options across languages when operator toggles lang (TG <-> RU)
  useEffect(() => {
    const from = lang === "tg" ? "ru" : "tg";
    const to = lang;

    const translateOption = (
      currentVal: string,
      fromList: { value: string }[],
      toList: { value: string }[]
    ) => {
      if (!currentVal) return null;
      const idx = fromList.findIndex((opt) => opt.value === currentVal);
      if (idx !== -1 && toList[idx]) {
        return toList[idx].value;
      }
      return null;
    };

    // Translate callStatus
    const newCallStatus = translateOption(
      callStatus,
      TRANSLATIONS[from].callStatusOptions,
      TRANSLATIONS[to].callStatusOptions
    );
    if (newCallStatus) {
      setValue("callStatus", newCallStatus);
    }

    // Translate hasPc
    const newPc = translateOption(
      selectedPc,
      TRANSLATIONS[from].pcOptions,
      TRANSLATIONS[to].pcOptions
    );
    if (newPc) {
      setValue("hasPc", newPc);
    }

    // Translate cameraStatus
    const newCamera = translateOption(
      selectedCamera,
      TRANSLATIONS[from].cameraOptions,
      TRANSLATIONS[to].cameraOptions
    );
    if (newCamera) {
      setValue("cameraStatus", newCamera);
    }

    // Translate micStatus
    const newMic = translateOption(
      selectedMic,
      TRANSLATIONS[from].micOptions,
      TRANSLATIONS[to].micOptions
    );
    if (newMic) {
      setValue("micStatus", newMic);
    }

    // Translate audioOutput
    const newAudio = translateOption(
      selectedAudio,
      TRANSLATIONS[from].audioOptions,
      TRANSLATIONS[to].audioOptions
    );
    if (newAudio) {
      setValue("audioOutput", newAudio);
    }

    // Translate hasDisplay
    const newDisplay = translateOption(
      selectedDisplay,
      TRANSLATIONS[from].displayOptions,
      TRANSLATIONS[to].displayOptions
    );
    if (newDisplay) {
      setValue("hasDisplay", newDisplay);
    }

    // Translate internetType
    const newInternet = translateOption(
      selectedInternetType,
      TRANSLATIONS[from].internetTypeOptions,
      TRANSLATIONS[to].internetTypeOptions
    );
    if (newInternet) {
      setValue("internetType", newInternet);
    }

    // Translate internetQuality
    const newQuality = translateOption(
      selectedQuality,
      TRANSLATIONS[from].internetQualityOptions,
      TRANSLATIONS[to].internetQualityOptions
    );
    if (newQuality) {
      setValue("internetQuality", newQuality);
    }

    // Translate provider if one of standard options was selected
    if (!isOtherProvider && selectedProvider) {
      const provIdx = TRANSLATIONS[from].providerOptions.indexOf(selectedProvider);
      if (provIdx !== -1 && TRANSLATIONS[to].providerOptions[provIdx]) {
        setValue("provider", TRANSLATIONS[to].providerOptions[provIdx]);
      }
    }

    // Translate Region & District if selected
    if (selectedRegion) {
      const fromRegions = from === "tg" ? TAJIKISTAN_REGIONS_TG : TAJIKISTAN_REGIONS_RU;
      const toRegions = to === "tg" ? TAJIKISTAN_REGIONS_TG : TAJIKISTAN_REGIONS_RU;
      const regionKeysFrom = Object.keys(fromRegions);
      const regionKeysTo = Object.keys(toRegions);
      const regIdx = regionKeysFrom.indexOf(selectedRegion);

      if (regIdx !== -1 && regionKeysTo[regIdx]) {
        const targetRegion = regionKeysTo[regIdx];
        setValue("region", targetRegion);

        if (selectedDistrict) {
          const distIdx = fromRegions[selectedRegion]?.indexOf(selectedDistrict);
          if (distIdx !== undefined && distIdx !== -1 && toRegions[targetRegion]?.[distIdx]) {
            const targetDistrict = toRegions[targetRegion][distIdx];
            setValue("district", targetDistrict);
            setValue("organization", generateDefaultOrganization(targetRegion, targetDistrict, to));
          } else {
            setValue("organization", generateDefaultOrganization(targetRegion, "", to));
          }
        } else {
          setValue("organization", generateDefaultOrganization(targetRegion, "", to));
        }
      }
    }
  }, [lang]);

  // Load operatorName, keepRegion, and daily callsCount from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOp = localStorage.getItem("moa_operator_name");
      if (savedOp) {
        setOperatorName(savedOp);
        setValue("operatorName", savedOp, { shouldValidate: true });
      }

      const savedKeep = localStorage.getItem("moa_keep_region");
      if (savedKeep !== null) {
        setKeepRegion(savedKeep === "true");
      }

      const todayKey = getTodayCallsKey();
      const savedCalls = localStorage.getItem(todayKey);
      if (savedCalls !== null) {
        setCallsCount(parseInt(savedCalls, 10) || 0);
      }
    }
  }, [setValue]);

  const handleResetCallsCount = () => {
    if (typeof window !== "undefined") {
      if (window.confirm(t.resetCallsConfirm)) {
        setCallsCount(0);
        localStorage.setItem(getTodayCallsKey(), "0");
      }
    }
  };

  const handleOperatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setOperatorName(val);
    setValue("operatorName", val, { shouldValidate: true });
    if (typeof window !== "undefined") {
      localStorage.setItem("moa_operator_name", val);
    }
  };

  const handleKeepRegionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setKeepRegion(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("moa_keep_region", val.toString());
    }
  };

  // Region change: update region, reset district, and auto-fill organization
  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRegion = e.target.value;
    setValue("region", newRegion, { shouldValidate: true });
    setValue("district", "", { shouldValidate: true });
    const autoOrg = generateDefaultOrganization(newRegion, "", lang);
    setValue("organization", autoOrg, { shouldValidate: true });
  };

  // District change: update district and auto-fill official department title
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDistrict = e.target.value;
    setValue("district", newDistrict, { shouldValidate: true });
    const autoOrg = generateDefaultOrganization(selectedRegion, newDistrict, lang);
    if (autoOrg) {
      setValue("organization", autoOrg, { shouldValidate: true });
    }
  };

  // Restore official department template name
  const restoreAutoOrganization = () => {
    const autoOrg = generateDefaultOrganization(selectedRegion, selectedDistrict, lang);
    if (autoOrg) {
      setValue("organization", autoOrg, { shouldValidate: true });
    }
  };

  // Function to prepare next call
  const prepareNextCall = useCallback(() => {
    const currentRegion = keepRegion ? selectedRegion : "";
    const defaultOrg = currentRegion ? generateDefaultOrganization(currentRegion, "", lang) : "";
    reset({
      operatorName: operatorName,
      callStatus: lang === "tg" ? "Тамос гирифта шуд (Бомуваффақият)" : "Дозвонились (Успешно)",
      region: currentRegion,
      district: "",
      organization: defaultOrg,
      fullName: "",
      position: "",
      phone: "",
      hasMessenger: false,
      hasPc: "",
      cameraStatus: "",
      micStatus: "",
      audioOutput: "",
      hasDisplay: "",
      internetType: "",
      provider: "",
      internetQuality: "",
      platforms: ["Zoom"],
      needsTest: false,
      comments: ""
    });
    setIsOtherProvider(false);
    setCustomProvider("");
    setServerError(null);
    setLastSavedToast(null);

    // Scroll smoothly to the call status / region section
    const target = document.getElementById("call-status-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [keepRegion, selectedRegion, operatorName, reset, lang]);

  const onSubmit = async (data: SurveyFormData) => {
    setServerError(null);
    try {
      const payload: SurveyFormData = {
        ...data,
        operatorName: operatorName || data.operatorName
      };

      const result = await submitSurvey(payload, lang);
      if (result.success) {
        setCallsCount((prev) => {
          const next = prev + 1;
          if (typeof window !== "undefined") {
            localStorage.setItem(getTodayCallsKey(), next.toString());
          }
          return next;
        });
        setLastSavedToast({
          id: Date.now(),
          district: data.district || data.region,
          status: data.callStatus
        });

        // Quick clean transition for operator flow
        setIsOtherProvider(false);
        setCustomProvider("");
        const currentRegion = keepRegion ? data.region : "";
        const defaultOrg = currentRegion ? generateDefaultOrganization(currentRegion, "", lang) : "";
        reset({
          operatorName: operatorName,
          callStatus: lang === "tg" ? "Тамос гирифта шуд (Бомуваффақият)" : "Дозвонились (Успешно)",
          region: currentRegion,
          district: "",
          organization: defaultOrg,
          fullName: "",
          position: "",
          phone: "",
          hasMessenger: false,
          hasPc: "",
          cameraStatus: "",
          micStatus: "",
          audioOutput: "",
          hasDisplay: "",
          internetType: "",
          provider: "",
          internetQuality: "",
          platforms: ["Zoom"],
          needsTest: false,
          comments: ""
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setServerError(
          result.error ||
            (lang === "tg"
              ? "Ирсоли сабт муяссар нашуд. Лутфан аз нав кӯшиш кунед."
              : "Не удалось сохранить запись. Попробуйте еще раз.")
        );
      }
    } catch {
      setServerError(
        lang === "tg"
          ? "Хатогии шабака ҳангоми ирсоли сабт. Пайвасти интернетро тафтиш кунед."
          : "Сетевая ошибка при отправке записи. Проверьте интернет-соединение."
      );
    }
  };

  // Hotkey: Ctrl + Enter / Cmd + Enter for immediate submission
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit(onSubmit)();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSubmit, onSubmit]);

  return (
    <div className="w-full max-w-4xl mx-auto py-5 sm:py-8 px-4 sm:px-6">
      {/* Top Header Controls: Operator Badge, Call Count & Language Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white rounded-2xl p-3 sm:p-4 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            <UserCheck className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <span className="text-slate-500 block">{t.callsCountLabel}</span>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-emerald-800 text-sm">{callsCount}</span>
              {callsCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetCallsCount}
                  title={t.resetCallsCountBtn}
                  className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono font-medium border border-slate-200/80">
            <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
            Ctrl + Enter
          </div>
        </div>
      </div>

      {/* Success Notification Banner (Compact & Streamlined for Call Stream) */}
      {lastSavedToast && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-500/80 text-emerald-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-sm sm:text-base text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                {t.recordSavedToast}
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                {lastSavedToast.district} • Статус: <strong>{lastSavedToast.status}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={prepareNextCall}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition cursor-pointer w-full sm:w-auto justify-center"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t.nextCallBtn}
          </button>
        </div>
      )}

      {/* Survey Title & Mission */}
      <header className="mb-7 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/70 border border-emerald-200/80 text-emerald-800 text-xs font-bold mb-3 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t.badgeVks}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-2xl mx-auto">
          {t.surveyTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-2 leading-relaxed">
          {t.surveySubtitle}
        </p>
      </header>

      {/* Global Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold">{t.errorAlert}</p>
            <p className="mt-1 text-rose-700">{serverError}</p>
          </div>
        </div>
      )}

      {/* FORM START */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        {/* OPERATOR PANEL SECTION */}
        <section className="bg-gradient-to-r from-emerald-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <label htmlFor="operatorName" className="block text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1.5">
                {t.operatorLabel} <span className="text-amber-400">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4 text-emerald-400" />
                </div>
                <input
                  id="operatorName"
                  type="text"
                  placeholder={t.operatorPlaceholder}
                  value={operatorName}
                  onChange={handleOperatorChange}
                  className="w-full rounded-xl bg-white/10 border border-emerald-500/40 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-emerald-200/50 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/15 transition"
                />
              </div>
              {errors.operatorName && (
                <p className="text-xs text-rose-300 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.operatorName.message}
                </p>
              )}
            </div>

            {/* Keep Region Toggle */}
            <div className="sm:border-l sm:border-white/10 sm:pl-5 flex flex-col justify-center">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={keepRegion}
                  onChange={handleKeepRegionToggle}
                  className="mt-0.5 w-4 h-4 text-emerald-500 rounded border-emerald-300 focus:ring-emerald-400 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-white block flex items-center gap-1">
                    <Pin className="w-3 h-3 text-amber-400" />
                    {t.keepRegionLabel}
                  </span>
                  <span className="text-emerald-200/70 text-[11px] block mt-0.5">
                    {t.keepRegionHint}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* CALL STATUS SECTION */}
        <section id="call-status-section" className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3 mb-4">
            <PhoneCall className="w-5 h-5 text-emerald-700" />
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.callStatusTitle} <span className="text-emerald-600">*</span></h2>
              <p className="text-xs text-slate-500">{t.callStatusSubtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {t.callStatusOptions.map((opt) => {
              const isSelected = callStatus === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border transition cursor-pointer text-left ${
                    isSelected
                      ? `${opt.color} shadow-xs ring-2`
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={opt.value}
                    {...register("callStatus")}
                    className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                  />
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-snug">
                      {opt.label}
                    </span>
                    <span className="text-[11px] text-slate-500 mt-0.5 block line-clamp-2">
                      {opt.sub}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          {!isCallSuccessful && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-50/90 border border-amber-200/90 text-amber-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.callStatusNotAnsweredBanner}</span>
            </div>
          )}
        </section>

        {/* SECTION 1: Region & District */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.sec1Title}</h2>
              <p className="text-xs text-slate-500">{t.sec1Subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Region Selection */}
            <div>
              <label htmlFor="region" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.regionLabel} <span className="text-emerald-600">*</span>
              </label>
              <select
                id="region"
                {...register("region")}
                onChange={handleRegionChange}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition cursor-pointer ${
                  errors.region ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <option value="">{t.regionPlaceholder}</option>
                {Object.keys(regionsData).map((reg) => (
                  <option key={reg} value={reg}>
                    {reg}
                  </option>
                ))}
              </select>
              {errors.region && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.region.message}
                </p>
              )}
            </div>

            {/* District Selection */}
            <div>
              <label htmlFor="district" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.districtLabel} <span className="text-emerald-600">*</span>
              </label>
              <select
                id="district"
                {...register("district")}
                onChange={handleDistrictChange}
                disabled={!selectedRegion}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed ${
                  errors.district ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                }`}
              >
                <option value="">
                  {selectedRegion ? t.districtPlaceholder : t.districtDisabledPlaceholder}
                </option>
                {availableDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
              {errors.district && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.district.message}
                </p>
              )}
            </div>

            {/* Organization Name (Auto-populated with manual edit allowed) */}
            <div className="sm:col-span-2">
              <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                <label htmlFor="organization" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider">
                  {t.orgLabel} {isCallSuccessful && <span className="text-emerald-600">*</span>}
                </label>
                {currentOrgValue && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/80 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {t.orgAutoBadge}
                    </span>
                    {(selectedRegion || selectedDistrict) && (
                      <button
                        type="button"
                        onClick={restoreAutoOrganization}
                        className="text-[11px] font-medium text-slate-500 hover:text-emerald-700 underline transition cursor-pointer"
                      >
                        {t.orgRestoreBtn}
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <input
                  id="organization"
                  type="text"
                  placeholder={t.orgPlaceholder}
                  {...register("organization")}
                  className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition bg-white ${
                    errors.organization ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                  }`}
                />
              </div>
              {errors.organization && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.organization.message}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: Contact Person */}
        <section className={`bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative transition-opacity ${!isCallSuccessful ? "opacity-90" : "opacity-100"}`}>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.sec2Title}</h2>
              <p className="text-xs text-slate-500">{t.sec2Subtitle}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.fullNameLabel} {isCallSuccessful && <span className="text-emerald-600">*</span>}
              </label>
              <input
                id="fullName"
                type="text"
                placeholder={t.fullNamePlaceholder}
                {...register("fullName")}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition ${
                  errors.fullName ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Position */}
            <div>
              <label htmlFor="position" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.positionLabel}
              </label>
              <input
                id="position"
                type="text"
                placeholder={t.positionPlaceholder}
                {...register("position")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition hover:border-slate-400"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.phoneLabel} {isCallSuccessful && <span className="text-emerald-600">*</span>}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="+992 90 000 0000"
                  {...register("phone")}
                  className={`w-full rounded-xl border pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition ${
                    errors.phone ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                  }`}
                />
              </div>
              {errors.phone ? (
                <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.phone.message}
                </p>
              ) : (
                <p className="text-[11px] text-slate-500 mt-1">{t.phoneHint}</p>
              )}
            </div>

            {/* Messenger Switch */}
            <div className="flex flex-col justify-center">
              <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("hasMessenger")}
                  className="mt-0.5 w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-600 cursor-pointer"
                />
                <div className="text-xs">
                  <span className="font-bold text-slate-800 block">{t.messengerLabel}</span>
                  <span className="text-slate-500 text-[11px]">{t.messengerHint}</span>
                </div>
              </label>
            </div>
          </div>
        </section>

        {/* SECTION 3, 4, 5: Technical Fields (Highlighted if Call Successful) */}
        {isCallSuccessful && (
          <>
            {/* SECTION 3: Equipment */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
                  3
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t.sec3Title}</h2>
                  <p className="text-xs text-slate-500">{t.sec3Subtitle}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* 3.1 PC */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Monitor className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      {t.pcLabel} <span className="text-emerald-600">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.pcOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedPc === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("hasPc")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.hasPc && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.hasPc.message}
                    </p>
                  )}
                </div>

                {/* 3.2 Camera */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Camera className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      {t.cameraLabel} <span className="text-emerald-600">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {t.cameraOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedCamera === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("cameraStatus")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.cameraStatus && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.cameraStatus.message}
                    </p>
                  )}
                </div>

                {/* 3.3 Mic */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mic className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      {t.micLabel} <span className="text-emerald-600">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {t.micOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedMic === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("micStatus")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.micStatus && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.micStatus.message}
                    </p>
                  )}
                </div>

                {/* 3.4 Audio */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      {t.audioLabel} <span className="text-emerald-600">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.audioOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedAudio === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("audioOutput")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.audioOutput && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.audioOutput.message}
                    </p>
                  )}
                </div>

                {/* 3.5 Display */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tv className="w-4 h-4 text-emerald-700" />
                    <label className="text-xs sm:text-sm font-bold text-slate-800">
                      {t.displayLabel} <span className="text-emerald-600">*</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.displayOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedDisplay === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("hasDisplay")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.hasDisplay && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.hasDisplay.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 4: Internet Connection */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
                  4
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t.sec4Title}</h2>
                  <p className="text-xs text-slate-500">{t.sec4Subtitle}</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* 4.1 Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    {t.internetTypeLabel} <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.internetTypeOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start gap-3 p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedInternetType === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <input
                          type="radio"
                          value={opt.value}
                          {...register("internetType")}
                          className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                          <span className="text-[11px] text-slate-500">{opt.sub}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.internetType && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.internetType.message}
                    </p>
                  )}
                </div>

                {/* 4.2 Provider Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    {t.providerLabel} <span className="text-emerald-600">*</span>
                  </label>

                  {/* Provider Pills / Buttons Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-2.5">
                    {t.providerOptions.map((prov) => {
                      const isSelected = !isOtherProvider && selectedProvider === prov;
                      return (
                        <button
                          key={prov}
                          type="button"
                          onClick={() => {
                            setIsOtherProvider(false);
                            setValue("provider", prov, { shouldValidate: true });
                          }}
                          className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer text-center ${
                            isSelected
                              ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-600/30 font-bold"
                              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white"
                          }`}
                        >
                          {prov}
                        </button>
                      );
                    })}

                    {/* "Other / Дигар" Option Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsOtherProvider(true);
                        setValue("provider", customProvider, { shouldValidate: true });
                      }}
                      className={`px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition cursor-pointer text-center ${
                        isOtherProvider
                          ? "border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs ring-2 ring-emerald-600/30 font-bold"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 bg-white"
                      }`}
                    >
                      {t.providerOtherOption}
                    </button>
                  </div>

                  {/* Input Field for "Other / Дигар" Provider */}
                  {isOtherProvider && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        placeholder={t.providerPlaceholder}
                        value={customProvider}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCustomProvider(val);
                          setValue("provider", val, { shouldValidate: true });
                        }}
                        className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition bg-white ${
                          errors.provider ? "border-rose-400 bg-rose-50/20" : "border-slate-300 hover:border-slate-400"
                        }`}
                        autoFocus
                      />
                    </div>
                  )}

                  {errors.provider && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.provider.message}
                    </p>
                  )}
                </div>

                {/* 4.3 Quality */}
                <div>
                  <label className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
                    {t.qualityLabel} <span className="text-emerald-600">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {t.internetQualityOptions.map((opt) => (
                      <label
                        key={opt.value}
                        className={`flex items-start justify-between p-3 rounded-xl border transition cursor-pointer text-left ${
                          selectedQuality === opt.value
                            ? "border-emerald-600 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-600"
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="radio"
                            value={opt.value}
                            {...register("internetQuality")}
                            className="mt-1 w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-600"
                          />
                          <div>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800 block">{opt.label}</span>
                            <span className="text-[11px] text-slate-500 line-clamp-1">{opt.sub}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ml-2 ${opt.color}`}>
                          {opt.badge}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.internetQuality && (
                    <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.internetQuality.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* SECTION 5: Platforms */}
            <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
                  5
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{t.sec5Title}</h2>
                  <p className="text-xs text-slate-500">{t.sec5Subtitle}</p>
                </div>
              </div>

              <Controller
                name="platforms"
                control={control}
                render={({ field }) => {
                  const currentValues: string[] = field.value || [];
                  const togglePlatform = (platformId: string) => {
                    if (currentValues.includes(platformId)) {
                      field.onChange(currentValues.filter((item) => item !== platformId));
                    } else {
                      field.onChange([...currentValues, platformId]);
                    }
                  };

                  return (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {PLATFORM_LIST.map((plat) => {
                        const isChecked = currentValues.includes(plat.id);
                        return (
                          <button
                            type="button"
                            key={plat.id}
                            onClick={() => togglePlatform(plat.id)}
                            className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs sm:text-sm font-medium transition cursor-pointer text-left ${
                              isChecked
                                ? "bg-emerald-50/80 border-emerald-600 text-emerald-900 shadow-xs ring-1 ring-emerald-600"
                                : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                isChecked ? "bg-emerald-600 border-emerald-600 text-white" : "border-slate-300 bg-white"
                              }`}
                            >
                              {isChecked && <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span>{plat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                }}
              />
            </section>
          </>
        )}

        {/* SECTION 6: Testing & Comments */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200/90 p-5 sm:p-6 relative">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100 font-bold text-xs">
              {isCallSuccessful ? "6" : "3"}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">{t.sec6Title}</h2>
              <p className="text-xs text-slate-500">{t.sec6Subtitle}</p>
            </div>
          </div>

          <div className="space-y-4">
            {isCallSuccessful && (
              <label className="flex items-start gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/40 border border-emerald-300 hover:border-emerald-500 transition cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("needsTest")}
                  className="mt-1 w-4 h-4 text-emerald-600 rounded border-emerald-400 focus:ring-emerald-600 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-slate-900 text-xs sm:text-sm block flex items-center gap-1.5">
                    <Headphones className="w-4 h-4 text-emerald-700" />
                    {t.needsTestTitle}
                  </span>
                  <span className="text-slate-600 text-[11px] sm:text-xs mt-0.5 block leading-relaxed">
                    {t.needsTestDesc}
                  </span>
                </div>
              </label>
            )}

            <div>
              <label htmlFor="comments" className="block text-xs font-semibold text-slate-800 uppercase tracking-wider mb-1.5">
                {t.commentsLabel}
              </label>
              <textarea
                id="comments"
                rows={isCallSuccessful ? 3 : 2}
                placeholder={t.commentsPlaceholder}
                {...register("comments")}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition hover:border-slate-400"
              />
            </div>
          </div>
        </section>

        {/* Action Controls & Fast Submit */}
        <div className="pt-2 pb-6 space-y-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-800 hover:from-emerald-900 hover:to-emerald-900 text-white font-bold text-base shadow-lg shadow-emerald-800/20 active:scale-[0.99] transition duration-200 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t.submitting}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{isCallSuccessful ? t.submitBtnFull : t.submitBtnCallOnly}</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span className="flex items-center gap-1.5">
              <CornerDownLeft className="w-3.5 h-3.5 text-slate-400" />
              {t.hotkeyHint}
            </span>
            <button
              type="button"
              onClick={prepareNextCall}
              className="text-slate-500 hover:text-emerald-700 underline font-medium cursor-pointer"
            >
              {t.nextCallBtn}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
