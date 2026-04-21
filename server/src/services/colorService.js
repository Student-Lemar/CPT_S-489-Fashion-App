/**
 * server/src/services/colorService.js
 *
 * Server-side color theory engine — ported from client/src/utils/colorUtils.ts
 * Uses Jimp for image-based color extraction (no browser canvas required).
 */

'use strict';

// ── Color map ─────────────────────────────────────────────────────────────────

const COLOR_MAP = {
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

const OCCASION_RULES = {
  everyday:    { tags: ['casual', 'daily', 'basic', 'clean', 'cozy'],              multiplier: 1    },
  school:      { tags: ['campus', 'casual', 'cozy', 'daily', 'layering'],          multiplier: 1.05 },
  office:      { tags: ['smart', 'office', 'clean', 'minimal', 'dressy'],          multiplier: 1.1  },
  'date-night':{ tags: ['night', 'dressy', 'clean', 'streetwear'],                 multiplier: 1.1  },
  streetwear:  { tags: ['streetwear', 'oversized', 'utility', 'layering'],         multiplier: 1.1  },
};

const STYLE_RULES = {
  balanced: ['clean', 'basic', 'daily', 'minimal'],
  minimal:  ['minimal', 'clean', 'basic'],
  casual:   ['casual', 'cozy', 'daily'],
  layered:  ['layering', 'oversized', 'cozy', 'streetwear'],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalizeColorName(name) {
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

function getColorMeta(name) {
  return COLOR_MAP[normalizeColorName(name)] ?? COLOR_MAP.gray;
}

function rgbFromHex(hex) {
  const c = hex.replace('#', '');
  return {
    r: parseInt(c.slice(0, 2), 16),
    g: parseInt(c.slice(2, 4), 16),
    b: parseInt(c.slice(4, 6), 16),
  };
}

function nearestNamedColor({ r, g, b }) {
  let bestName = 'gray';
  let bestDist = Infinity;
  for (const [name, meta] of Object.entries(COLOR_MAP)) {
    const s = rgbFromHex(meta.hex);
    const dist = Math.sqrt((r - s.r) ** 2 + (g - s.g) ** 2 + (b - s.b) ** 2);
    if (dist < bestDist) { bestDist = dist; bestName = name; }
  }
  return bestName;
}

// ── Image color extraction (Jimp) ─────────────────────────────────────────────

/**
 * Extract the dominant named color from a base64 data URL using Jimp.
 * Returns a color name string or null if extraction fails.
 * @param {string} dataUrl  base64 data URL (e.g. "data:image/png;base64,...")
 * @returns {Promise<string|null>}
 */
async function extractColorFromDataUrl(dataUrl) {
  try {
    // Strip data URL prefix to get raw base64
    const base64 = dataUrl.replace(/^data:image\/[a-z+]+;base64,/i, '');
    const buffer = Buffer.from(base64, 'base64');

    const Jimp = require('jimp');
    const image = await Jimp.read(buffer);

    // Resize to a small thumb for speed
    const THUMB = 24;
    image.resize(THUMB, Jimp.AUTO);

    const { width, height } = image.bitmap;
    let rSum = 0, gSum = 0, bSum = 0, count = 0;

    image.scan(0, 0, width, height, function (x, y, idx) {
      const alpha = this.bitmap.data[idx + 3];
      if (alpha < 80) return; // skip transparent pixels

      const rv = this.bitmap.data[idx];
      const gv = this.bitmap.data[idx + 1];
      const bv = this.bitmap.data[idx + 2];
      const brightness = (rv + gv + bv) / 3;
      if (brightness > 248) return; // skip near-white background

      rSum += rv; gSum += gv; bSum += bv; count++;
    });

    if (!count) return null;
    return nearestNamedColor({
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count),
    });
  } catch (err) {
    console.warn('[colorService] extractColorFromDataUrl failed:', err.message);
    return null;
  }
}

// ── Outfit scoring ────────────────────────────────────────────────────────────

function hueDistance(a, b) {
  if (a == null || b == null) return 0;
  const diff = Math.abs(a - b) % 360;
  return Math.min(diff, 360 - diff);
}

function pairHarmonyScore(a, b, harmony) {
  const ca = a.aiColor; const cb = b.aiColor;
  if (!ca || !cb) return 0;
  if (ca.neutral || cb.neutral) return harmony === 'neutral-balance' ? 12 : 8;
  const dist = hueDistance(ca.hue, cb.hue);
  if (harmony === 'monochrome')      return Math.max(0, 20 - dist / 4);
  if (harmony === 'analogous')       return dist <= 45 ? 20 - dist / 3 : Math.max(0, 6 - dist / 30);
  if (harmony === 'complementary')   return Math.max(0, 22 - Math.abs(180 - dist) / 4);
  if (harmony === 'neutral-balance') return ca.neutral || cb.neutral ? 14 : Math.max(0, 10 - dist / 10);
  return Math.max(0, 12 - Math.abs(90 - dist) / 10);
}

function tagScore(item, tags) {
  const its = (item.tags || []).map((t) => t.toLowerCase());
  return tags.reduce((s, t) => s + (its.includes(t) ? 1 : 0), 0);
}

function scoreCombo(combo, { harmony, occasion, style, preferredColor }) {
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
  if (harmony === 'monochrome'      && unique <= 2) score += 10;
  if (harmony === 'analogous'       && unique <= 3) score += 6;
  if (harmony === 'neutral-balance' && items.filter((i) => i.aiColor.neutral).length >= 2) score += 12;

  if (preferredColor && preferredColor !== 'any')
    score += items.filter((i) => i.aiColor.colorName === preferredColor).length * 5;

  if (style === 'layered' && combo.extras?.some((i) => i.category === 'outerwear')) score += 10;
  if (occasion === 'office' && items.some((i) => (i.tags || []).includes('dressy'))) score += 6;

  return Math.round(score * 10) / 10;
}

function comboItems(combo) {
  return [combo.top, combo.bottom, combo.shoes, ...(combo.extras ?? [])].filter(Boolean);
}

function autoHarmony(items) {
  const colorful = items.filter((i) => !i.aiColor.neutral);
  if (!colorful.length) return 'neutral-balance';
  const hues = colorful.map((i) => i.aiColor.hue).filter((h) => h != null);
  if (!hues.length) return 'neutral-balance';
  const spread = Math.max(...hues) - Math.min(...hues);
  if (spread <= 20) return 'monochrome';
  if (spread <= 50) return 'analogous';
  return 'complementary';
}

function chooseOptional(primary, optionals, harmony, filterColor) {
  if (!optionals.length) return [];
  return optionals
    .map((item) => {
      let score =
        pairHarmonyScore(primary.top, item, harmony) +
        pairHarmonyScore(primary.bottom, item, harmony) +
        pairHarmonyScore(primary.shoes, item, harmony);
      if (filterColor && filterColor !== 'any' && normalizeColorName(item.aiColor?.colorName ?? item.color) === filterColor)
        score += 4;
      return { item, score };
    })
    .sort((a, b) => b.score - a.score)
    .filter((e) => e.score > 0)
    .slice(0, 2)
    .map((e) => e.item);
}

// ── Enrich an item with AI color (using its stored colorExtracted or manual) ──

/**
 * Enrich a raw Item DB row with aiColor metadata.
 * If the item has a colorExtracted field set, that's used.
 * Otherwise falls back to the item's color string.
 * Does NOT re-scan the image (call extractColorFromDataUrl separately).
 * @param {object} item  raw Item model instance or plain object
 * @returns {object}  item + aiColor field
 */
function enrichItem(item) {
  const raw = item.dataValues ?? item;
  const colorName = normalizeColorName(raw.colorExtracted || raw.color);
  return {
    ...raw,
    aiColor: { colorName, source: raw.colorExtracted ? 'image' : 'manual', ...getColorMeta(colorName) },
  };
}

// ── Outfit generation ─────────────────────────────────────────────────────────

/**
 * Generate up to `maxSuggestions` ranked outfit suggestions from a wardrobe.
 *
 * @param {object[]} items      Array of enriched item objects (with aiColor)
 * @param {object}   filters    { harmony, occasion, style, preferredColor }
 * @param {number}   maxSuggestions
 * @returns {object[]}  Array of suggestion objects
 */
function generateSuggestions(items, filters = {}, maxSuggestions = 3) {
  const {
    harmony: requestedHarmony = 'auto',
    occasion = 'everyday',
    style = 'balanced',
    preferredColor = 'any',
  } = filters;

  const tops       = items.filter((i) => i.category === 'tops');
  const bottoms    = items.filter((i) => i.category === 'bottoms');
  const shoes      = items.filter((i) => i.category === 'shoes');
  const outerwear  = items.filter((i) => i.category === 'outerwear');
  const accessories= items.filter((i) => i.category === 'accessories');

  if (!tops.length || !bottoms.length || !shoes.length) {
    return [];
  }

  // Determine harmony for scoring
  const allColored = [...tops, ...bottoms, ...shoes];
  const harmony = requestedHarmony === 'auto' ? autoHarmony(allColored) : requestedHarmony;

  // Build combos: top × bottom × shoes (capped to avoid combinatorial explosion)
  const combos = [];
  for (const top of tops.slice(0, 8)) {
    for (const bottom of bottoms.slice(0, 8)) {
      for (const shoe of shoes.slice(0, 8)) {
        const primary = { top, bottom, shoes: shoe };
        const extras = chooseOptional(primary, [...outerwear, ...accessories], harmony, preferredColor);
        combos.push({ ...primary, extras });
      }
    }
  }

  // Score and sort
  const scored = combos
    .map((combo) => ({ combo, score: scoreCombo(combo, { harmony, occasion, style, preferredColor }) }))
    .sort((a, b) => b.score - a.score);

  // De-duplicate: ensure different tops/bottoms across top suggestions
  const seen = new Set();
  const results = [];
  for (const { combo, score } of scored) {
    const key = `${combo.top.id}:${combo.bottom.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ combo, score, harmony });
    if (results.length >= maxSuggestions) break;
  }

  return results.map(({ combo, score, harmony: h }, idx) => ({
    rank: idx + 1,
    score,
    harmony: h,
    items: comboItems(combo).map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      color: item.color,
      colorExtracted: item.colorExtracted ?? null,
      aiColor: item.aiColor,
      icon: item.icon,
      imageDataUrl: item.imageDataUrl ?? null,
      tags: item.tags ?? [],
    })),
    label: `${h.charAt(0).toUpperCase() + h.slice(1)} harmony — ${combo.top.name}, ${combo.bottom.name}, ${combo.shoes.name}`,
  }));
}

module.exports = {
  COLOR_MAP,
  OCCASION_RULES,
  STYLE_RULES,
  normalizeColorName,
  getColorMeta,
  nearestNamedColor,
  extractColorFromDataUrl,
  enrichItem,
  scoreCombo,
  generateSuggestions,
  autoHarmony,
};
