// ─────────────────────────────────────────────────────────────────────────────
// Wedding Timeline Localization Dictionary & Helpers
// Provides seamless Arabic / English translation for features, activities,
// ceremony variations, and timeline events.
// ─────────────────────────────────────────────────────────────────────────────

import {
  type CeremonyVariation,
  type CeremonyType,
  type WeddingFeature,
  CEREMONY_OPTIONS,
} from "./wedding-timeline-config";

export const TIMELINE_ARABIC_LABELS: Record<string, string> = {
  "Muslim Ceremony": "مراسم إسلامية",
  "Katb Ketab + Wedding": "كتب كتاب + فرح",
  "Katb Ketab Only": "كتب كتاب فقط",
  "Wedding Only": "فرح فقط",
  "Christian Ceremony": "مراسم مسيحية",
  "Church + Venue": "إكليل في الكنيسة + حفل في القاعة",
  "Church Only": "إكليل في الكنيسة فقط",
  "Venue Only": "حفل في القاعة فقط",
  "Arrival at the venue": "الوصول لمكان التجهيز / القاعة",
  "Hair & Veil": "الشعر وتثبيت الطرحة",
  "Makeup": "الميكب",
  "Getting ready pictures": "صور التجهيزات",
  "Wearing dress & suit": "ارتداء الفستان والبدلة",
  "getting ready to leave": "الاستعداد للتحرك",
  "Picking up the bride": "لقاء العريس بالعروسة واستلامها",
  "First look": "الفيرست لوك (First Look)",
  "Moving to Photoshoot Location": "التحرك لمكان السيشن",
  "Couple Photoshoot": "سيشن العروسين",
  "Family Photoshoot": "تصوير العائلة",
  "Bridal Party Photoshoot": "تصوير وصيفات وأصدقاء العروسين",
  "Moving to Katb Ketab Location": "التحرك لمكان كتب الكتاب",
  "Guest Arrival": "وصول الضيوف",
  "Grand Entrance": "الدخول الكبير",
  "Katb Ketab": "مراسم كتب الكتاب",
  "Zaffa": "الزفة",
  "Party": "الحفل والرقص",
  "Dinner": "بوفيه العشاء",
  "Party Ends": "نهاية الحفل وتوديع الضيوف",
  "Heading to the photoshoot": "التحرك لجلسة التصوير",
  "Moving to Mosque / Katb Ketab Location": "التحرك للمسجد / مكان كتب الكتاب",
  "Katb Ketab Pictures & Greetings": "صور ومباركات كتب الكتاب",
  "Heading to the venue": "التحرك لمكان القاعة",
  "Moving to Church": "التحرك إلى الكنيسة",
  "Church Ceremony": "صلاة الإكليل في الكنيسة",
  "Salamat & Pictures": "السلامات والصور التذكارية",
  "Moving to Venue": "التحرك إلى مكان الحفل",
  "Settling": "الاستقرار وأخذ استراحة",
  "transport to church": "الانتقال إلى الكنيسة",
  "Moving to church": "التحرك إلى الكنيسة",
  "Wedding": "الفرح",
};

export const TIMELINE_ARABIC_ACTIVITIES: Record<string, string> = {
  "_": "_",
  "Arrival at the venue": "الوصول لمكان التجهيز / القاعة",
  "Hair Styling": "تصفيف الشعر",
  "Hair Styling (for non hijabis)": "تصفيف الشعر (لغير المحجبات)",
  "Makeup": "الميكب",
  "Arriving & Getting Ready": "الوصول وبدء التجهيز",
  "Arriving And Getting Ready": "الوصول وبدء التجهيز",
  "Getting Ready": "التجهيزات والتحضير",
  "Getting Ready Photos": "تصوير لقطات التجهيز",
  "Break": "استراحة قصيرة",
  "Wearing Dress": "ارتداء فستان الفرح",
  "Wearing Suit": "ارتداء البدلة",
  "Helping Bride": "مساعدة العروسة",
  "Helping Groom": "مساعدة العريس",
  "getting ready to leave": "الاستعداد للتحرك",
  "bride only pictures": "تصوير العروسة لوحدها",
  "Picking up the bride": "استلام العريس للعروسة",
  "Celebrating": "الاحتفال والفرحة",
  "First Look": "الفيرست لوك (First Look)",
  "cheering the couple up": "الاحتفال مع العروسين وتشجيعهم",
  "Moving to Photoshoot Location": "التحرك لمكان السيشن",
  "Couple Photoshoot": "سيشن العروسين",
  "Photoshoot Break": "استراحة السيشن",
  "Family Photoshoot": "تصوير العائلة",
  "Arriving ": "الوصول",
  "Arriving": "الوصول",
  "arriving": "الوصول",
  "Bridal Party Photoshoot": "تصوير مع الأصحاب والوصيفات",
  "Moving to Katb Ketab Location": "التحرك لمكان كتب الكتاب",
  "Guests Arrival/Bridal party break": "وصول الضيوف / استراحة العروسين",
  "Grand Entrance": "الدخول الكبير",
  "Katb Ketab Ceremony": "مراسم كتب الكتاب",
  "Zaffa": "الزفة",
  "Party / Dancing": "الحفل والرقص",
  "Dinner": "بوفيه العشاء",
  "Party Ends": "نهاية الحفل وتوديع الضيوف",
  "Waiting for the groom": "انتظار وصول العريس",
  "Heading to the photoshoot": "التحرك إلى السيشن",
  "Moving to Mosque / Katb Ketab Location": "التحرك للمسجد / مكان كتب الكتاب",
  "Pictures & Greetings": "التقاط الصور والمباركات",
  "Photos": "التقاط الصور",
  "Heading to the venue": "التحرك إلى القاعة",
  "Hair Styling ": "تصفيف الشعر",
  "Heading to Church / Guest Arrival": "التحرك للكنيسة / استقبال الضيوف",
  "Church Ceremony": "صلاة الإكليل في الكنيسة",
  "Salamat & Photos": "المباركات والتهاني والسلامات",
  "Heading to Venue": "التحرك إلى القاعة",
  "Freshening Up": "تعديل الميكب وأخذ أنفاس",
  "arriving to groom's house": "الوصول لمنزل العريس",
  "Moving to church": "التحرك إلى الكنيسة",
  "Break / Transition": "استراحة / انتقال",
  "New Activity": "فقرة جديدة",
};

/**
 * Returns localized label for a feature
 */
export function getLocalizedFeatureLabel(label: string, locale: string): string {
  if (locale !== "ar") return label;
  const trimmed = label.trim();
  return TIMELINE_ARABIC_LABELS[trimmed] || TIMELINE_ARABIC_LABELS[label] || label;
}

/**
 * Returns localized text for an activity
 */
export function getLocalizedActivity(activity: string, locale: string): string {
  if (locale !== "ar") return activity;
  if (!activity || activity === "_" || activity.trim() === "") return activity;
  const trimmed = activity.trim();
  return TIMELINE_ARABIC_ACTIVITIES[trimmed] || TIMELINE_ARABIC_ACTIVITIES[activity] || activity;
}

/**
 * Localizes an entire feature definition for rendering in the checklist
 */
export function localizeFeature(feature: WeddingFeature, locale: string): WeddingFeature {
  if (locale !== "ar") return feature;
  return {
    ...feature,
    label: getLocalizedFeatureLabel(feature.label, locale),
    activities: {
      bride: getLocalizedActivity(feature.activities.bride, locale),
      groom: getLocalizedActivity(feature.activities.groom, locale),
      bridesmaids: getLocalizedActivity(feature.activities.bridesmaids, locale),
      groomsmen: getLocalizedActivity(feature.activities.groomsmen, locale),
    },
  };
}

/**
 * Formats timeLabel to use ص and م in Arabic, or AM and PM in English
 */
export function formatTimelineTimeLabel(timeLabel?: string, locale: string = "en"): string {
  if (!timeLabel) return "";
  if (locale === "ar") {
    return timeLabel
      .replace(/(\d+:\d+)\s*AM/gi, "$1 ص")
      .replace(/(\d+:\d+)\s*PM/gi, "$1 م")
      .replace(/AM/gi, "ص")
      .replace(/PM/gi, "م");
  }
  return timeLabel
    .replace(/(\d+:\d+)\s*ص/g, "$1 AM")
    .replace(/(\d+:\d+)\s*م/g, "$1 PM")
    .replace(/ص/g, "AM")
    .replace(/م/g, "PM");
}

/**
 * Localizes a single timeline event object (for UI and saving)
 */
export function localizeEvent<T extends {
  id: string;
  brideActivity: string;
  groomActivity: string;
  bridesmaidsActivity: string;
  groomsmenActivity: string;
  duration: number;
  timeLabel?: string;
  translations?: any;
}>(event: T, locale: string): T {
  const arBride = event.translations?.ar?.brideActivity || getLocalizedActivity(event.brideActivity, "ar");
  const arGroom = event.translations?.ar?.groomActivity || getLocalizedActivity(event.groomActivity, "ar");
  const arBridesmaids = event.translations?.ar?.bridesmaidsActivity || getLocalizedActivity(event.bridesmaidsActivity, "ar");
  const arGroomsmen = event.translations?.ar?.groomsmenActivity || getLocalizedActivity(event.groomsmenActivity, "ar");
  const localizedTimeLabel = event.timeLabel ? formatTimelineTimeLabel(event.timeLabel, locale) : event.timeLabel;

  if (locale === "ar") {
    return {
      ...event,
      timeLabel: localizedTimeLabel,
      brideActivity: arBride || event.brideActivity,
      groomActivity: arGroom || event.groomActivity,
      bridesmaidsActivity: arBridesmaids || event.bridesmaidsActivity,
      groomsmenActivity: arGroomsmen || event.groomsmenActivity,
      translations: {
        ar: {
          brideActivity: arBride,
          groomActivity: arGroom,
          bridesmaidsActivity: arBridesmaids,
          groomsmenActivity: arGroomsmen,
          timeLabel: localizedTimeLabel,
        },
      },
    };
  }

  return {
    ...event,
    timeLabel: localizedTimeLabel,
    translations: {
      ar: {
        brideActivity: arBride,
        groomActivity: arGroom,
        bridesmaidsActivity: arBridesmaids,
        groomsmenActivity: arGroomsmen,
        timeLabel: event.timeLabel,
      },
    },
  };
}

/**
 * Localizes ceremony variation labels
 */
export function getLocalizedVariationLabel(id: string, defaultLabel: string, locale?: string): string {
  const isSecondArgLocale = defaultLabel === "ar" || defaultLabel === "en";
  const actualLocale = locale || (isSecondArgLocale ? defaultLabel : "en");
  const fallbackLabel = isSecondArgLocale ? id : defaultLabel;
  if (actualLocale !== "ar") return fallbackLabel;
  return TIMELINE_ARABIC_LABELS[fallbackLabel] || fallbackLabel;
}
