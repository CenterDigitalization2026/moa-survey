"use server";

import { SurveyFormData, SurveySchema } from "@/lib/survey-schema";

export type SubmitResult = {
  success: boolean;
  error?: string;
  message?: string;
};

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
      submittedAt: new Date().toISOString()
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
