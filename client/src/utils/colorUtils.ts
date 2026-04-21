import type { ColorMeta, EnrichedItem, OutfitCombo, HarmonyMode, OccasionMode, StyleMode } from '../types';

// ── Color map ─────────────────────────────────────────────────────────────────

export const COLOR_MAP: Record<string, ColorMeta> = {
  black:  { hex: '#1e1e1e', hue: null, neutral: true,  family: 'neutral' },
  white:  { hex: '#f6f6f3', hue: null, neutral: true,  family: 'neutral' },
  gray:   { hex: '#8f949c', hue: null, neutral: true,  family: 'neutral' },
  brown:  { hex: '#8b5a3c', hue: 28,   neutral: true,  family: 'earth'   },
  blue:   { hex: '#4a78d1', hue: 220,  neutral: false, family: 'cool'    },
  green:  { hex: '#5a8f4d', hue: 120,  neutral: false, family: 'earth'   },
  pink:   { hex: '#e07ca8', hue: 330,  neutral: false, family: 'warm'    },
  red:    { hex: '#c34a3f', hue: 5,    neutral: false, family: 'warm'    },
  orange: { hex: '#d88336', hue: 28,   neutral: false, family: 'warm'    },
  yellow: { hex: '#d9c44e', hue: 55,   neutral: false, family: 'warm'    },
  purple: { hex: '#7f63c9', hue: 270,  neutral: false, family: 'cool'    },
};

export const OCCASION_RULES: Record<OccasionMode, { tags: string[]; multiplier: number }> = {
  everyday:   { tags: ['casual', 'daily', 'basic', 'clean', 'cozy'],                  multiplier: 1    },
  school:     { tags: ['campus', 'casual', 'cozy', 'daily', 'layering'],              multiplier: 1.05 },
  office:     { tags: ['smart', 'office', 'clean', 'minimal', 'dressy'],              multiplier: 1.1  },
  'date-night': { tags: ['night', 'dressy', 'clean', 'streetwear'],                   multiplier: 1.1  },
  streetwear: { tags: ['streetwear', 'oversized', 'utility', 'layering'],             multiplier: 1.1  },
};

export const STYLE_RULES: Record<StyleMode, string[]> = {
  balanced: ['clean', 'basic', 'daily', 'minimal'],
  minimal:  ['minimal', 'clean', 'basic'],
  casual:   ['casual', 'cozy', 'daily'],
  layered:  ['layering', 'oversized', 'cozy', 'streetwear'],
};

// ── Color helpers ─────────────────────────────────────────────────────────────

export function normalizeColorName(name: string): string {
  const v = String(name || '').trim().toLowerCase();
  if (v.includes('navy') || v.includes('blue')) return 'blue';
  if (v.includes('olive') || v.includes('sage') || v.includes('green')) return 'green';
  if (v.includes('tan') || v.includes('beige') || v.includes('khaki') || v.includes('brown')) return 'brown';
  if (v.includes('charcoal') || v.includes('grey') || v.includes('gray') || v.includes('silver')) return 'gray';
  if (v.includes('cream') || v.includes('ivory') || v.includes('white')) return 'white';
  if (v.includes('black')) return 'black';
  if (v.includes('pink') || v.includes('rose')) return 'pink';
  if (v.includes('red') || v.includes('maroon') || v.includes('burgundy')) return 'red';
  if (v.includes('orange') || v.includes('rust')) return 'orange';
  if (v.includes('yellow') || v.includes('gold')) return 'yellow';
  if (v.includes('purple') || v.includes('lavender') || v.includes('violet')) return 'purple';
  return COLOR_MAP[v] ? v : 'gray';
}

export function getColorMeta(name: string): ColorMeta {
  return COLOR_MAP[normalizeColorName(name)] ?? COLOR_MAP.gray;
}

function rgbFromHex(hex: string): { r: number; g: number; b: number } {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function nearestNamedColor(rgb: { r: number; g: number; b: number }): string {
  let bestName = 'gray';
  let bestDist = Infinity;
  for (const [name, meta] of Object.entries(COLOR_MAP)) {
    const s = rgbFromHex(meta.hex);
    const dist = Math.sqrt((rgb.r - s.r) ** 2 + (rgb.g - s.g) ** 2 + (rgb.b - s.b) ** 2);
    if (dist < bestDist) { bestDist = dist; bestName = name; }
  }
  return bestName;
}

export async function detectImageColor(dataUrl: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const w = 24;
        const h = Math.max(1, Math.round((img.height / img.width) * w));
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        const { data } = ctx.getImageData(0, 0, w, h);
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 80) continue;
          const br = (data[i] + data[i + 1] + data[i + 2]) / 3;
          if (br > 248) continue;
          r += data[i]; g += data[i + 1]; b += data[i + 2]; count++;
        }
        if (!count) return resolve(null);
        resolve(nearestNamedColor({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }));
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}

const imageColorCache = new Map<string, Promise<string | null>>();

export async function getColorProfile(
  item: EnrichedItem,
  useImageScan: boolean,
): Promise<EnrichedItem['aiColor']> {
  if (!useImageScan || !item.imageDataUrl) {
    const colorName = normalizeColorName(item.color);
    return { source: 'manual', colorName, ...getColorMeta(colorName) };
  }
  if (!imageColorCache.has(item.id)) {
    imageColorCache.set(item.id, detectImageColor(item.imageDataUrl));
  }
  const detected = await imageColorCache.get(item.id)!;
  const colorName = normalizeColorName(detected ?? item.color);
  return { source: detected ? 'image' : 'manual', colorName, ...getColorMeta(colorName) };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function hueDistance(a: number | null, b: number | null): number {
  if (a == null || b == null) return 0;
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

function pairHarmonyScore(
  a: EnrichedItem,
  b: EnrichedItem,
  harmony: string,
): number {
  const ca = a.aiColor; const cb = b.aiColor;
  if (!ca || !cb) return 0;
  if (ca.neutral || cb.neutral) return harmony === 'neutral-balance' ? 12 : 8;
  const dist = hueDistance(ca.hue, cb.hue);
  if (harmony === 'monochrome') return Math.max(0, 20 - dist / 4);
  if (harmony === 'analogous') return dist <= 45 ? 20 - dist / 3 : Math.max(0, 6 - dist / 30);
  if (harmony === 'complementary') return Math.max(0, 22 - Math.abs(180 - dist) / 4);
  if (harmony === 'neutral-balance') return ca.neutral || cb.neutral ? 14 : Math.max(0, 10 - dist / 10);
  return Math.max(0, 12 - Math.abs(90 - dist) / 10);
}

function tagScore(item: EnrichedItem, tags: string[]): number {
  const its = (item.tags || []).map((t) => t.toLowerCase());
  return tags.reduce((s, t) => s + (its.includes(t) ? 1 : 0), 0);
}

export function scoreCombo(
  combo: OutfitCombo,
  filters: { harmony: string; occasion: OccasionMode; style: StyleMode; preferredColor: string },
): number {
  const { harmony, occasion, style, preferredColor } = filters;
  const items = comboItems(combo);

  let score =
    pairHarmonyScore(combo.top, combo.bottom, harmony) +
    pairHarmonyScore(combo.top, combo.shoes, harmony) +
    pairHarmonyScore(combo.bottom, combo.shoes, harmony);

  if (combo.extras?.length)
    score += combo.extras.reduce((s, e) => s + pairHarmonyScore(combo.top, e, harmony) / 2, 0);

  const rule = OCCASION_RULES[occasion] ?? OCCASION_RULES.everyday;
  score += items.reduce((s, i) => s + tagScore(i, rule.tags), 0) * 2 * rule.multiplier;
  score += items.reduce((s, i) => s + tagScore(i, STYLE_RULES[style] ?? []), 0) * 1.6;

  const unique = new Set(items.map((i) => i.aiColor.colorName)).size;
  if (harmony === 'monochrome' && unique <= 2) score += 10;
  if (harmony === 'analogous' && unique <= 3) score += 6;
  if (harmony === 'neutral-balance' && items.filter((i) => i.aiColor.neutral).length >= 2) score += 12;

  if (preferredColor !== 'any')
    score += items.filter((i) => i.aiColor.colorName === preferredColor).length * 5;

  if (style === 'layered' && combo.extras?.some((i) => i.category === 'outerwear')) score += 10;
  if (occasion === 'office' && items.some((i) => (i.tags || []).includes('dressy'))) score += 6;

  return Math.round(score * 10) / 10;
}

export function comboItems(combo: OutfitCombo): EnrichedItem[] {
  return [combo.top, combo.bottom, combo.shoes, ...(combo.extras ?? [])].filter(Boolean);
}

export function autoHarmony(items: EnrichedItem[]): HarmonyMode {
  const colorful = items.filter((i) => !i.aiColor.neutral);
  if (!colorful.length) return 'neutral-balance';
  const hues = colorful.map((i) => i.aiColor.hue).filter((h): h is number => h != null);
  if (!hues.length) return 'neutral-balance';
  const spread = Math.max(...hues) - Math.min(...hues);
  if (spread <= 20) return 'monochrome';
  if (spread <= 50) return 'analogous';
  return 'complementary';
}

export function chooseOptional(
  primary: OutfitCombo,
  optionals: EnrichedItem[],
  harmony: string,
  filterColor: string,
): EnrichedItem[] {
  if (!optionals.length) return [];
  return optionals
    .map((item) => {
      let score =
        pairHarmonyScore(primary.top, item, harmony) +
        pairHarmonyScore(primary.bottom, item, harmony) +
        pairHarmonyScore(primary.shoes, item, harmony);
      if (filterColor !== 'any' && normalizeColorName(item.aiColor?.colorName ?? item.color) === filterColor)
        score += 4;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((e) => e.score > 0)
    .slice(0, 2)
    .map((e) => e.item);
}
