import type { ItemCategory } from "../types";

export function getIconForCategory(category: ItemCategory | string): string {
  const map: Record<string, string> = {
    tops: "👕",
    bottoms: "👖",
    shoes: "👟",
    outerwear: "🧥",
    accessories: "👜",
  };
  return map[category] ?? "👕";
}

export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function capitalize(text: string): string {
  return String(text || "").replace(/(^|[-\s])\w/g, (m) => m.toUpperCase());
}

export function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
