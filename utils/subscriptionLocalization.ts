export interface LocalizedSubItem {
  packageId?: string;
  packageName?: string;
  packageNameAr?: string;
  tier?: string;
  categoryName?: string;
}

const PACKAGE_ID_TO_AR_NAME: Record<string, string> = {
  // Gehaz Full Experience
  "687396821b4da119eb1c13fe": "رحلة جهازك الكاملة مع وايفي",
  // Gehaz Mini Experience
  "68bf6ae9c4d5c1af12cdcd37": "رحلة جهازك المصغّرة",
  // Wedding Full Experience
  "6965e63c6df4503dda02c12b": "فرحك مع وايفى",
  // Wedding Mini Experience
  "6a2d9aec3def6ce76dc7babc": "فرحك مع وايفى (المصغرة)",
};

export function getLocalizedPackageName(
  item: LocalizedSubItem | null | undefined,
  locale: string
): string {
  if (!item) return "";
  const name = item.packageName || "";

  if (locale !== "ar") {
    return name;
  }

  // 1. If explicit Arabic package name is provided on item
  if (item.packageNameAr) {
    return item.packageNameAr;
  }

  // 2. If name already has Arabic characters
  if (/[\u0600-\u06FF]/.test(name)) {
    return name;
  }

  // 3. Match by packageId
  if (item.packageId && PACKAGE_ID_TO_AR_NAME[item.packageId]) {
    return PACKAGE_ID_TO_AR_NAME[item.packageId];
  }

  const lower = name.toLowerCase();

  // 4. Match Wedding patterns
  const isWedding =
    lower.includes("wedding") ||
    (item.categoryName && item.categoryName.toLowerCase().includes("wedding"));
  const isGehaz =
    lower.includes("gehaz") ||
    lower.includes("wifey") ||
    (item.categoryName &&
      (item.categoryName.toLowerCase().includes("gehaz") ||
        item.categoryName.toLowerCase().includes("wifey")));
  const isMini = lower.includes("mini") || item.tier === "mini";
  const isFull = lower.includes("full") || item.tier === "full";

  if (isWedding) {
    if (isFull) return "فرحك مع وايفى";
    if (isMini) return "فرحك مع وايفى (المصغرة)";
    return "فرحك مع وايفى";
  }

  if (isGehaz) {
    if (isFull) return "رحلة جهازك الكاملة مع وايفي";
    if (isMini) return "رحلة جهازك المصغّرة";
    return "رحلة جهازك مع وايفى";
  }

  if (isFull) return "رحلة جهازك الكاملة مع وايفي";
  if (isMini) return "رحلة جهازك المصغّرة";

  return name;
}

export function getLocalizedTier(
  tier: string | undefined | null,
  locale: string
): string {
  if (!tier) return "";
  if (locale === "ar") {
    if (tier.toLowerCase() === "full") return "التجربة الكاملة";
    if (tier.toLowerCase() === "mini") return "التجربة المصغرة";
    return tier;
  }
  return tier.charAt(0).toUpperCase() + tier.slice(1);
}
