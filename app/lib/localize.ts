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

/**
 * Localizes a Product document, deeply translating variations and attributes.
 */
export function localizeProduct<T = any>(product: T, locale: string = "en"): T {
  if (!product || typeof product !== "object" || locale !== "ar") {
    return product;
  }

  const prod: any = product;
  const arTrans = prod.translations?.ar;

  const localizedTitle = (arTrans?.title && arTrans.title.trim() !== "") ? arTrans.title : prod.title;
  const localizedDescription = (arTrans?.description && arTrans.description.trim() !== "") ? arTrans.description : prod.description;
  const localizedDimensions = (arTrans?.productDimensions && arTrans.productDimensions.length > 0) ? arTrans.productDimensions : prod.productDimensions;
  const localizedDetails = (arTrans?.productDetails && arTrans.productDetails.length > 0) ? arTrans.productDetails : prod.productDetails;
  const localizedCare = (arTrans?.productCare && arTrans.productCare.length > 0) ? arTrans.productCare : prod.productCare;
  const localizedSeason = (arTrans?.season && arTrans.season.trim() !== "") ? arTrans.season : prod.season;

  const localizedVariations = Array.isArray(prod.variations)
    ? prod.variations.map((v: any) => {
        const vAr = v.translations?.ar;
        const vName = (vAr?.name && vAr.name.trim() !== "") ? vAr.name : v.name;
        const vAttr = (vAr?.attributeName && vAr.attributeName.trim() !== "") ? vAr.attributeName : v.attributeName;

        const localizedAttrs = Array.isArray(v.attributes)
          ? v.attributes.map((attr: any) => {
              const attrAr = attr.translations?.ar;
              const attrName = (attrAr?.name && attrAr.name.trim() !== "") ? attrAr.name : attr.name;
              return { ...attr, name: attrName };
            })
          : v.attributes;

        return {
          ...v,
          name: vName,
          attributeName: vAttr,
          attributes: localizedAttrs,
        };
      })
    : prod.variations;

  return {
    ...prod,
    title: localizedTitle,
    description: localizedDescription,
    productDimensions: localizedDimensions,
    productDetails: localizedDetails,
    productCare: localizedCare,
    season: localizedSeason,
    variations: localizedVariations,
  };
}

/**
 * Localizes a Package document, deeply translating items, cards, supportCards, and features.
 */
export function localizePackage<T = any>(pkg: T, locale: string = "en"): T {
  if (!pkg || typeof pkg !== "object" || locale !== "ar") {
    return pkg;
  }

  const p: any = pkg;
  const arTrans = p.translations?.ar;

  const localizedName = (arTrans?.name && arTrans.name.trim() !== "") ? arTrans.name : p.name;
  const localizedPartOf = (arTrans?.partOf && arTrans.partOf.trim() !== "") ? arTrans.partOf : p.partOf;
  const localizedSaving = (arTrans?.saving && arTrans.saving.trim() !== "") ? arTrans.saving : p.saving;
  const localizedBadgeLabel = (arTrans?.badgeLabel && arTrans.badgeLabel.trim() !== "") ? arTrans.badgeLabel : p.badgeLabel;
  const localizedCalloutBadge = (arTrans?.calloutBadge && arTrans.calloutBadge.trim() !== "") ? arTrans.calloutBadge : p.calloutBadge;
  const localizedCalloutTitle = (arTrans?.calloutTitle && arTrans.calloutTitle.trim() !== "") ? arTrans.calloutTitle : p.calloutTitle;
  const localizedCalloutDescription = (arTrans?.calloutDescription && arTrans.calloutDescription.trim() !== "") ? arTrans.calloutDescription : p.calloutDescription;
  const localizedHeroTitle = (arTrans?.heroTitle && arTrans.heroTitle.trim() !== "") ? arTrans.heroTitle : p.heroTitle;
  const localizedHeroSubtitle = (arTrans?.heroSubtitle && arTrans.heroSubtitle.trim() !== "") ? arTrans.heroSubtitle : p.heroSubtitle;
  const localizedNotes = (arTrans?.notes && Array.isArray(arTrans.notes) && arTrans.notes.length > 0) ? arTrans.notes : p.notes;

  const localizedItems = Array.isArray(p.items)
    ? p.items.map((it: any) => {
        const itAr = it.translations?.ar;
        const itVal = (itAr?.value && itAr.value.trim() !== "") ? itAr.value : it.value;
        return { ...it, value: itVal };
      })
    : p.items;

  const localizedComparisonFeatures = Array.isArray(p.comparisonFeatures)
    ? p.comparisonFeatures.map((feat: any) => {
        const featAr = feat.translations?.ar;
        const fName = (featAr?.feature && featAr.feature.trim() !== "") ? featAr.feature : feat.feature;
        const fFull = (featAr?.fullValue && featAr.fullValue.trim() !== "") ? featAr.fullValue : feat.fullValue;
        const fMini = (featAr?.miniValue && featAr.miniValue.trim() !== "") ? featAr.miniValue : feat.miniValue;
        return {
          ...feat,
          feature: fName,
          fullValue: fFull,
          miniValue: fMini,
        };
      })
    : p.comparisonFeatures;

  const localizedSupportCards = Array.isArray(p.supportCards)
    ? p.supportCards.map((sc: any) => {
        const scAr = sc.translations?.ar;
        const scTitle = (scAr?.title && scAr.title.trim() !== "") ? scAr.title : sc.title;
        const scDesc = (scAr?.description && Array.isArray(scAr.description) && scAr.description.length > 0) ? scAr.description : sc.description;
        return { ...sc, title: scTitle, description: scDesc };
      })
    : p.supportCards;

  const localizedCards = Array.isArray(p.cards)
    ? p.cards.map((c: any) => {
        const cAr = c.translations?.ar;
        const cPoints = (cAr?.points && Array.isArray(cAr.points) && cAr.points.length > 0) ? cAr.points : c.points;
        return { ...c, points: cPoints };
      })
    : p.cards;

  const localizedVariants = Array.isArray(p.variants)
    ? p.variants.map((v: any) => {
        const vAr = v.translations?.ar;
        const vSaving = (vAr?.saving && vAr.saving.trim() !== "") ? vAr.saving : v.saving;
        return { ...v, saving: vSaving };
      })
    : p.variants;

  const localizedPackageProducts = Array.isArray(p.packageProducts)
    ? p.packageProducts.map((prod: any) => (prod && typeof prod === "object" ? localizeProduct(prod, locale) : prod))
    : p.packageProducts;

  return {
    ...p,
    name: localizedName,
    partOf: localizedPartOf,
    saving: localizedSaving,
    badgeLabel: localizedBadgeLabel,
    calloutBadge: localizedCalloutBadge,
    calloutTitle: localizedCalloutTitle,
    calloutDescription: localizedCalloutDescription,
    heroTitle: localizedHeroTitle,
    heroSubtitle: localizedHeroSubtitle,
    notes: localizedNotes,
    items: localizedItems,
    comparisonFeatures: localizedComparisonFeatures,
    supportCards: localizedSupportCards,
    cards: localizedCards,
    variants: localizedVariants,
    packageProducts: localizedPackageProducts,
  };
}

/**
 * Localizes a Category document safely.
 */
export function localizeCategory<T = any>(category: T, locale: string = "en"): T {
  if (!category || typeof category !== "object" || locale !== "ar") {
    return category;
  }
  const c: any = category;
  const arTrans = c.translations?.ar;
  return {
    ...c,
    name: arTrans?.categoryName || c.categoryName || c.name,
    categoryName: arTrans?.categoryName || c.categoryName,
    description: arTrans?.description !== undefined && arTrans.description !== "" ? arTrans.description : c.description,
  };
}

/**
 * Localizes a Subcategory document safely.
 */
export function localizeSubcategory<T = any>(subcategory: T, locale: string = "en"): T {
  if (!subcategory || typeof subcategory !== "object" || locale !== "ar") {
    return subcategory;
  }
  const s: any = subcategory;
  const arTrans = s.translations?.ar;
  return {
    ...s,
    name: arTrans?.subCategoryName || s.subCategoryName || s.name,
    subCategoryName: arTrans?.subCategoryName || s.subCategoryName,
    description: arTrans?.description !== undefined && arTrans.description !== "" ? arTrans.description : s.description,
  };
}

