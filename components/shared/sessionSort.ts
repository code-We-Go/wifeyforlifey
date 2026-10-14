export type SessionSortKey =
  | "default"
  | "price-asc"
  | "price-desc"
  | "name-asc";

export interface SortableSession {
  _id?: string;
  title?: string;
  price?: number;
  order?: number;
  createdAt?: string | Date;
  variants?: Array<{ price?: number }>;
  [key: string]: any;
}

export const SESSION_SORT_OPTIONS: { value: SessionSortKey; label: string }[] = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Title: A to Z" },
];

export function getSessionMinPrice(session: SortableSession): number {
  if (session.variants && session.variants.length > 0) {
    const validPrices = session.variants
      .map((v) => Number(v.price))
      .filter((p) => !isNaN(p) && p >= 0);
    if (validPrices.length > 0) {
      return Math.min(...validPrices);
    }
  }
  return Number(session.price) || 0;
}

export function getSessionTimestamp(session: SortableSession): number {
  if (session.createdAt) {
    const t = new Date(session.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  // Fallback: extract timestamp from 24-char MongoDB ObjectId if available
  if (session._id && typeof session._id === "string" && session._id.length === 24) {
    const t = parseInt(session._id.substring(0, 8), 16) * 1000;
    if (!isNaN(t) && t > 0) return t;
  }
  return 0;
}

export function sortSessions<T extends SortableSession>(
  sessions: T[],
  sortBy: SessionSortKey = "default"
): T[] {
  return [...sessions].sort((a, b) => {
    switch (sortBy) {
      case "default": {
        // Dashboard sort: by order ascending, then latest date as secondary fallback
        const orderA = a.order ?? 0;
        const orderB = b.order ?? 0;
        if (orderA !== orderB) return orderA - orderB;
        return getSessionTimestamp(b) - getSessionTimestamp(a);
      }
      case "price-asc": {
        const priceA = getSessionMinPrice(a);
        const priceB = getSessionMinPrice(b);
        if (priceA !== priceB) return priceA - priceB;
        return (a.order ?? 0) - (b.order ?? 0);
      }
      case "price-desc": {
        const priceA = getSessionMinPrice(a);
        const priceB = getSessionMinPrice(b);
        if (priceB !== priceA) return priceB - priceA;
        return (a.order ?? 0) - (b.order ?? 0);
      }
      case "name-asc": {
        return (a.title || "").localeCompare(b.title || "", undefined, {
          sensitivity: "base",
        });
      }
      default:
        return 0;
    }
  });
}
