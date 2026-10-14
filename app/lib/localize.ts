/**
 * Localization helper for database documents.
 * 
 * Guarantees 100% backward compatibility:
 * - If locale is 'ar' and translations.ar.[field] exists, it returns the Arabic value.
 * - Otherwise (for 'en', missing translations, or existing unmodified records),
 *   it seamlessly falls back to the original English field.
 */

export function getLocalizedField<T = string>(
  doc: any,
  field: string,
  locale: string = "en"
): T {
  if (!doc) return undefined as any;

  if (locale === "ar") {
    const arVal = doc?.translations?.ar?.[field];
    if (arVal !== undefined && arVal !== null && arVal !== "") {
      return arVal as T;
    }
  }

  return doc?.[field] as T;
}

/**
 * Localizes a single plain object (e.g., from .lean() or .toObject()).
 * Copies localized fields to the top-level keys while preserving the original doc.
 */
export function localizeDoc<T extends Record<string, any>>(
  doc: T,
  locale: string = "en",
  translatableFields: string[] = []
): T {
  if (!doc || typeof doc !== "object") return doc;
  if (locale !== "ar") return doc;

  const arTranslations = doc?.translations?.ar;
  if (!arTranslations) return doc;

  const result = { ...doc };
  const fields = translatableFields.length > 0
    ? translatableFields
    : Object.keys(arTranslations);

  for (const field of fields) {
    const arVal = arTranslations[field];
    if (arVal !== undefined && arVal !== null && arVal !== "") {
      (result as any)[field] = arVal;
    }
  }

  return result;
}

/**
 * Localizes an array of plain objects.
 */
export function localizeList<T extends Record<string, any>>(
  list: T[],
  locale: string = "en",
  translatableFields: string[] = []
): T[] {
  if (!Array.isArray(list)) return [];
  if (locale !== "ar") return list;
  return list.map((item) => localizeDoc(item, locale, translatableFields));
}
