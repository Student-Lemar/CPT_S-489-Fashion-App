/**
 * server/src/routes/colors.js
 *
 * Color-related endpoints:
 *   POST /api/colors/extract/:itemId   — run server-side color extraction on an item's image
 *   POST /api/colors/generate          — generate outfit suggestions for the calling user
 *   GET  /api/colors/meta              — return the full COLOR_MAP (used by client for display)
 */

'use strict';

const express = require('express');
const { Item } = require('../models');
const { authenticate } = require('../middleware/auth');
const {
  COLOR_MAP,
  extractColorFromDataUrl,
  enrichItem,
  generateSuggestions,
  normalizeColorName,
} = require('../services/colorService');

const router = express.Router();

// ── GET /api/colors/meta ──────────────────────────────────────────────────────
// Public — returns the color name → metadata mapping used by the client.
router.get('/meta', (_req, res) => {
  res.json(COLOR_MAP);
});

// ── POST /api/colors/extract/:itemId ─────────────────────────────────────────
// Private — extract dominant color from an item's stored imageDataUrl using Jimp.
// On success, saves the result back to item.colorExtracted and responds with the item.
router.post('/extract/:itemId', authenticate, async (req, res) => {
  try {
    const item = await Item.findOne({
      where: { id: req.params.itemId, ownerUsername: req.user.username },
    });
    if (!item) return res.status(404).json({ error: 'Item not found' });

    if (!item.imageDataUrl) {
      return res.status(422).json({ error: 'Item has no image — upload an image first' });
    }

    const detected = await extractColorFromDataUrl(item.imageDataUrl);
    if (!detected) {
      return res.status(422).json({ error: 'Could not extract a color from this image' });
    }

    item.colorExtracted = normalizeColorName(detected);
    await item.save();

    res.json({
      id: item.id,
      color: item.color,
      colorExtracted: item.colorExtracted,
      aiColor: {
        colorName: item.colorExtracted,
        source: 'image',
        ...COLOR_MAP[item.colorExtracted],
      },
    });
  } catch (err) {
    console.error('[POST /colors/extract]', err);
    res.status(500).json({ error: 'Color extraction failed' });
  }
});

// ── POST /api/colors/generate ─────────────────────────────────────────────────
// Private — generate outfit suggestions from the user's wardrobe.
// Body (all optional):
//   harmony       'auto' | 'monochrome' | 'analogous' | 'complementary' | 'neutral-balance'
//   occasion      'everyday' | 'school' | 'office' | 'date-night' | 'streetwear'
//   style         'balanced' | 'minimal' | 'casual' | 'layered'
//   preferredColor  color name or 'any'
//   maxSuggestions  number (default 3, max 10)
//   useImageColors  boolean — if true, run extraction on items that have images but no colorExtracted yet
router.post('/generate', authenticate, async (req, res) => {
  try {
    const {
      harmony = 'auto',
      occasion = 'everyday',
      style = 'balanced',
      preferredColor = 'any',
      maxSuggestions = 3,
      useImageColors = false,
    } = req.body;

    // Load all items for this user
    const rawItems = await Item.findAll({ where: { ownerUsername: req.user.username } });
    if (!rawItems.length) {
      return res.status(422).json({ error: 'Your wardrobe is empty' });
    }

    // Optionally run image extraction for items that have images but no colorExtracted yet
    if (useImageColors) {
      const needsExtraction = rawItems.filter((i) => i.imageDataUrl && !i.colorExtracted);
      await Promise.all(
        needsExtraction.map(async (item) => {
          const detected = await extractColorFromDataUrl(item.imageDataUrl);
          if (detected) {
            item.colorExtracted = normalizeColorName(detected);
            await item.save();
          }
        })
      );
    }

    // Enrich items with AI color metadata
    const enriched = rawItems.map(enrichItem);

    // Generate suggestions
    const capped = Math.min(Number(maxSuggestions) || 3, 10);
    const suggestions = generateSuggestions(enriched, { harmony, occasion, style, preferredColor }, capped);

    if (!suggestions.length) {
      return res.status(422).json({
        error: 'Not enough items to generate outfits — you need at least one top, one bottom, and one pair of shoes',
      });
    }

    res.json({ suggestions, harmony: suggestions[0]?.harmony ?? harmony });
  } catch (err) {
    console.error('[POST /colors/generate]', err);
    res.status(500).json({ error: 'Outfit generation failed' });
  }
});

module.exports = router;
