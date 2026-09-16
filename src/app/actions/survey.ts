"use server";

import { SurveyFormData, SurveySchema } from "@/lib/survey-schema";

export type SubmitResult = {
  success: boolean;
  error?: string;
  message?: string;
};

export type CompletedDistrict = {
  region: string;
  district: string;
  status: string;
  isCompleted: boolean;
};

export async function getCompletedDistricts(): Promise<CompletedDistrict[]> {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      console.warn("GOOGLE_SCRIPT_URL is not configured in environment variables");
      return [];
    }

    const response = await fetch(scriptUrl, {
      method: "GET",
      headers: {
        Accept: "application/json"
      },
      cache: "no-store",
      next: { revalidate: 0 },
      redirect: "follow"
    });

    if (!response.ok) {
      console.error(`Google Script GET failed: ${response.status} ${response.statusText}`);
      return [];
    }

    const json = await response.json();
    let rawItems: any[] = [];

    if (Array.isArray(json)) {
      rawItems = json;
    } else if (Array.isArray(json?.data)) {
      rawItems = json.data;
    } else if (Array.isArray(json?.completedDistricts)) {
      rawItems = json.completedDistricts;
    } else if (Array.isArray(json?.items)) {
      rawItems = json.items;
    }

    return rawItems
      .map((item: any) => {
        const region = String(item.region || item.Region || "").trim();
        const district = String(item.district || item.District || "").trim();
        const status = String(item.status || item.callStatus || item.Status || "").trim();

        // Determine if survey is successfully completed
        const isCompleted =
          typeof item.isCompleted === "boolean"
            ? item.isCompleted
            : item.isCompleted === "true" ||
              status === "Дозвонились (Успешно)" ||
              status === "Тамос гирифта шуд (Бомуваффақият)" ||
              status.toLowerCase() === "answered" ||
              status.toLowerCase() === "completed";

        return {
          region,
          district,
          status,
          isCompleted
        };
      })
      .filter((item) => item.district.length > 0);
  } catch (err: unknown) {
    console.error("Error in getCompletedDistricts:", err);
    return [];
  }
}

export async function submitSurvey(data: SurveyFormData, lang: "tg" | "ru" = "tg"): Promise<SubmitResult> {
  try {
    const validated = SurveySchema.safeParse(data);
    if (!validated.success) {
      const issues = validated.error.issues.map((i) => i.message).join("; ");
      return { success: false, error: `Ошибка валидации данных: ${issues}` };
    }

    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    if (!scriptUrl) {
      return {
        success: false,
        error: "URL вебхука Google Apps Script не настроен в конфигурации сервера (.env.local)"
      };
    }

    const payload = {
      ...validated.data,
      lang,
      // Provide localized textual values in case Google Apps Script reads them
      hasMessengerText: lang === "tg" ? (validated.data.hasMessenger ? "Ҳа" : "Не") : (validated.data.hasMessenger ? "Да" : "Нет"),
      needsTestText: lang === "tg" ? (validated.data.needsTest ? "Ҳа, санҷиш лозим аст" : "Не") : (validated.data.needsTest ? "Да, требуется проверка" : "Нет"),
      // Also send string representation if Google Apps Script simply appends row item directly
      hasMessenger: validated.data.hasMessenger ? (lang === "tg" ? "Ҳа" : "Да") : (lang === "tg" ? "Не" : "Нет"),
      needsTest: validated.data.needsTest ? (lang === "tg" ? "Ҳа, санҷиш лозим аст" : "Не") : (lang === "tg" ? "Да, требуется проверка" : "Нет"),
      hasMessengerBool: validated.data.hasMessenger,
      needsTestBool: validated.data.needsTest,
      platformsText: Array.isArray(validated.data.platforms) ? validated.data.platforms.join(", ") : (validated.data.platforms || ""),
      submittedAt: new Date().toISOString(),
      submittedAtLocal: new Date().toLocaleString("ru-RU", { timeZone: "Asia/Dushanbe" })
    };

    const response = await fetch(scriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store"
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        success: false,
        error: `Ошибка ответа Google Script (HTTP ${response.status}): ${errorText || "Сервер вернул ошибку"}`
      };
    }

    return { success: true };
  } catch (err: unknown) {
    console.error("Survey submission error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Сетевая ошибка при передаче данных"
    };
  }
}
