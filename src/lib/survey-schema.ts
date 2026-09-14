import { z } from "zod";

export const SurveySchema = z
  .object({
    operatorName: z
      .string()
      .min(2, "Лутфан номи операторро ворид намоед / Укажите имя оператора"),
    callStatus: z
      .string()
      .min(1, "Ҳолати зангро интихоб намоед / Укажите статус звонка"),
    region: z
      .string()
      .min(1, "Вилоят / минтақаро интихоб намоед / Выберите область или регион"),
    district: z
      .string()
      .min(1, "Шаҳр / ноҳияро интихоб намоед / Выберите город или район"),
    organization: z.string(),
    fullName: z.string(),
    position: z.string(),
    phone: z.string(),
    hasMessenger: z.boolean(),
    hasPc: z.string(),
    cameraStatus: z.string(),
    micStatus: z.string(),
    audioOutput: z.string(),
    hasDisplay: z.string(),
    internetType: z.string(),
    provider: z.string(),
    internetQuality: z.string(),
    platforms: z.array(z.string()),
    needsTest: z.boolean(),
    comments: z.string()
  })
  .superRefine((data, ctx) => {
    const isAnswered =
      data.callStatus === "Дозвонились (Успешно)" ||
      data.callStatus === "Тамос гирифта шуд (Бомуваффақият)" ||
      data.callStatus === "answered";

    if (isAnswered) {
      if (!data.organization || data.organization.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organization"],
          message: "Номи сохторро ворид кунед / Укажите наименование организации"
        });
      }
      if (!data.fullName || data.fullName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["fullName"],
          message: "Ному насаби масъулро ворид кунед / Укажите ФИО ответственного"
        });
      }
      if (!data.phone || data.phone.trim().length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["phone"],
          message: "Рақами телефонро ворид кунед / Укажите контактный номер телефона"
        });
      }
      if (!data.hasPc) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasPc"],
          message: "Ҳолати компютерро интихоб намоед / Укажите наличие ПК"
        });
      }
      if (!data.cameraStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cameraStatus"],
          message: "Ҳолати веб-камераро интихоб намоед / Укажите статус веб-камеры"
        });
      }
      if (!data.micStatus) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["micStatus"],
          message: "Ҳолати микрофонро интихоб намоед / Укажите статус микрофона"
        });
      }
      if (!data.audioOutput) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["audioOutput"],
          message: "Дастгоҳи овозро интихоб намоед / Укажите устройство вывода звука"
        });
      }
      if (!data.hasDisplay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["hasDisplay"],
          message: "Мавҷудияти экранро интихоб намоед / Укажите наличие экрана / ТВ"
        });
      }
      if (!data.internetType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["internetType"],
          message: "Усули пайвастшавиро интихоб намоед / Укажите тип подключения"
        });
      }
      if (!data.provider || data.provider.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["provider"],
          message: "Провайдерро нишон диҳед / Укажите интернет-провайдера"
        });
      }
      if (!data.internetQuality) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["internetQuality"],
          message: "Сифати интернетро баҳо диҳед / Оцените качество интернета"
        });
      }
    }
  });

export type SurveyFormData = z.infer<typeof SurveySchema>;
