import { Ipackage, PackageVariant } from "@/app/interfaces/interfaces";

export interface PricingResult {
  price: number;
  discountedFrom?: number;
  saving?: string;
}

export interface ResolvePriceOptions {
  duration?: number;
  variantIndex?: number;
  variant?: PackageVariant | any;
  edition?: string;
  isArabic?: boolean;
}

/**
 * Resolves the effective price, discountedFrom, and saving text for a package or variant.
 * If edition is "ar" (or isArabic is true), checks for Arabic price/discountedFrom/saving
 * in translations.ar, falling back to original English values if not specified.
 */
export function resolvePackagePrice(
  pkg: Ipackage | any,
  opts?: ResolvePriceOptions
): PricingResult {
  if (!pkg) {
    return { price: 0 };
  }

  const isAr = opts?.edition === "ar" || opts?.isArabic === true;

  // 1. Determine if a variant is targeted
  let matchedVariant: (PackageVariant & any) | undefined = opts?.variant;

  if (!matchedVariant && pkg.variants && Array.isArray(pkg.variants) && pkg.variants.length > 0) {
    if (opts?.variantIndex !== undefined && opts.variantIndex >= 0 && opts.variantIndex < pkg.variants.length) {
      matchedVariant = pkg.variants[opts.variantIndex];
    } else if (opts?.duration !== undefined) {
      matchedVariant = pkg.variants.find((v: any) => Number(v.duration) === Number(opts.duration));
    }
  }

  if (matchedVariant) {
    let variantPrice = matchedVariant.price ?? 0;
    let variantDiscountedFrom = matchedVariant.discountedFrom;
    let variantSaving = matchedVariant.saving;

    if (isAr) {
      const arPrice = matchedVariant.translations?.ar?.price;
      if (typeof arPrice === "number" && arPrice > 0) {
        variantPrice = arPrice;
      }
      const arDiscountedFrom = matchedVariant.translations?.ar?.discountedFrom;
      if (typeof arDiscountedFrom === "number" && arDiscountedFrom > 0) {
        variantDiscountedFrom = arDiscountedFrom;
      }
      const arSaving = matchedVariant.translations?.ar?.saving;
      if (arSaving) {
        variantSaving = arSaving;
      }
    }

    return {
      price: variantPrice,
      discountedFrom:
        variantDiscountedFrom && variantDiscountedFrom > variantPrice
          ? variantDiscountedFrom
          : undefined,
      saving: variantSaving,
    };
  }

  // 2. Base package pricing
  let basePrice = pkg.price ?? 0;
  let baseDiscountedFrom = pkg.discountedFrom;
  let baseSaving = pkg.saving;

  if (isAr) {
    const arPrice = pkg.translations?.ar?.price;
    if (typeof arPrice === "number" && arPrice > 0) {
      basePrice = arPrice;
    }
    const arDiscountedFrom = pkg.translations?.ar?.discountedFrom;
    if (typeof arDiscountedFrom === "number" && arDiscountedFrom > 0) {
      baseDiscountedFrom = arDiscountedFrom;
    }
    const arSaving = pkg.translations?.ar?.saving;
    if (arSaving) {
      baseSaving = arSaving;
    }
  }

  return {
    price: basePrice,
    discountedFrom:
      baseDiscountedFrom && baseDiscountedFrom > basePrice
        ? baseDiscountedFrom
        : undefined,
    saving: baseSaving,
  };
}
