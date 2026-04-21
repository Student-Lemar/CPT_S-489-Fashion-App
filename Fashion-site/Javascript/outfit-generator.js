(function () {
  const App = window.FashionApp;
  const user = App?.getSession();
  if (!App || !user) return;

  const statusMsg = document.getElementById('statusMsg');
  const generateBtn = document.getElementById('generateBtn');
  const surpriseBtn = document.getElementById('surpriseBtn');
  const slots = {
    top: document.getElementById('topSlot'),
    bottom: document.getElementById('bottomSlot'),
    shoes: document.getElementById('shoesSlot')
  };
  const labels = {
    top: document.getElementById('topLabel'),
    bottom: document.getElementById('bottomLabel'),
    shoes: document.getElementById('shoesLabel')
  };
  const title = document.getElementById('outfitTitle');
  const reason = document.getElementById('outfitReason');
  const paletteBar = document.getElementById('paletteBar');
  const aiConfidence = document.getElementById('aiConfidence');
  const insightList = document.getElementById('insightList');
  const suggestionsList = document.getElementById('suggestionsList');
  const previewLink = document.getElementById('saveOutfitLink');

  const colorMap = {
    black: { hex: '#1e1e1e', hue: null, neutral: true, family: 'neutral' },
    white: { hex: '#f6f6f3', hue: null, neutral: true, family: 'neutral' },
    gray: { hex: '#8f949c', hue: null, neutral: true, family: 'neutral' },
    brown: { hex: '#8b5a3c', hue: 28, neutral: true, family: 'earth' },
    blue: { hex: '#4a78d1', hue: 220, neutral: false, family: 'cool' },
    green: { hex: '#5a8f4d', hue: 120, neutral: false, family: 'earth' },
    pink: { hex: '#e07ca8', hue: 330, neutral: false, family: 'warm' },
    red: { hex: '#c34a3f', hue: 5, neutral: false, family: 'warm' },
    orange: { hex: '#d88336', hue: 28, neutral: false, family: 'warm' },
    yellow: { hex: '#d9c44e', hue: 55, neutral: false, family: 'warm' },
    purple: { hex: '#7f63c9', hue: 270, neutral: false, family: 'cool' }
  };

  const occasionRules = {
    everyday: { tags: ['casual', 'daily', 'basic', 'clean', 'cozy'], multiplier: 1 },
    school: { tags: ['campus', 'casual', 'cozy', 'daily', 'layering'], multiplier: 1.05 },
    office: { tags: ['smart', 'office', 'clean', 'minimal', 'dressy'], multiplier: 1.1 },
    'date-night': { tags: ['night', 'dressy', 'clean', 'streetwear'], multiplier: 1.1 },
    streetwear: { tags: ['streetwear', 'oversized', 'utility', 'layering'], multiplier: 1.1 }
  };

  const styleRules = {
    balanced: ['clean', 'basic', 'daily', 'minimal'],
    minimal: ['minimal', 'clean', 'basic'],
    casual: ['casual', 'cozy', 'daily'],
    layered: ['layering', 'oversized', 'cozy', 'streetwear']
  };

  let currentOutfit = null;
  let latestSuggestions = [];
  const imageColorCache = new Map();

  function setStatus(text, kind) {
    statusMsg.textContent = text;
    statusMsg.className = `status${kind ? ` ${kind}` : ''}`;
  }

  function pick(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function normalizeColorName(name) {
    const value = String(name || '').trim().toLowerCase();
    if (value.includes('navy') || value.includes('blue')) return 'blue';
    if (value.includes('olive') || value.includes('sage') || value.includes('green')) return 'green';
    if (value.includes('tan') || value.includes('beige') || value.includes('khaki') || value.includes('brown')) return 'brown';
    if (value.includes('charcoal') || value.includes('grey') || value.includes('gray') || value.includes('silver')) return 'gray';
    if (value.includes('cream') || value.includes('ivory') || value.includes('white')) return 'white';
    if (value.includes('black')) return 'black';
    if (value.includes('pink') || value.includes('rose')) return 'pink';
    if (value.includes('red') || value.includes('maroon') || value.includes('burgundy')) return 'red';
    if (value.includes('orange') || value.includes('rust')) return 'orange';
    if (value.includes('yellow') || value.includes('gold')) return 'yellow';
    if (value.includes('purple') || value.includes('lavender') || value.includes('violet')) return 'purple';
    return colorMap[value] ? value : 'gray';
  }

  function capitalize(text) {
    return String(text || '').replace(/(^|[-\s])\w/g, match => match.toUpperCase());
  }

  function categoryLabel(category) {
    return {
      tops: 'Top',
      bottoms: 'Bottom',
      shoes: 'Shoes',
      outerwear: 'Outerwear',
      accessories: 'Accessory'
    }[category] || 'Item';
  }

  function getColorMeta(name) {
    return colorMap[normalizeColorName(name)] || colorMap.gray;
  }

  function hueDistance(a, b) {
    if (a == null || b == null) return 0;
    const diff = Math.abs(a - b) % 360;
    return Math.min(diff, 360 - diff);
  }

  function rgbFromHex(hex) {
    const cleaned = hex.replace('#', '');
    return {
      r: parseInt(cleaned.slice(0, 2), 16),
      g: parseInt(cleaned.slice(2, 4), 16),
      b: parseInt(cleaned.slice(4, 6), 16)
    };
  }

  function nearestNamedColor(rgb) {
    let bestName = 'gray';
    let bestDistance = Infinity;
    Object.entries(colorMap).forEach(([name, meta]) => {
      const sample = rgbFromHex(meta.hex);
      const distance = Math.sqrt(((rgb.r - sample.r) ** 2) + ((rgb.g - sample.g) ** 2) + ((rgb.b - sample.b) ** 2));
      if (distance < bestDistance) {
        bestDistance = distance;
        bestName = name;
      }
    });
    return bestName;
  }

  function detectImageColor(dataUrl) {
    return new Promise(resolve => {
      if (!dataUrl) return resolve(null);
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const width = 24;
          const height = Math.max(1, Math.round((img.height / img.width) * width));
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0, width, height);
          const { data } = ctx.getImageData(0, 0, width, height);
          let r = 0, g = 0, b = 0, count = 0;
          for (let i = 0; i < data.length; i += 4) {
            const alpha = data[i + 3];
            if (alpha < 80) continue;
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];
            const brightness = (red + green + blue) / 3;
            if (brightness > 248) continue;
            r += red;
            g += green;
            b += blue;
            count += 1;
          }
          if (!count) return resolve(null);
          resolve(nearestNamedColor({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) }));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = dataUrl;
    });
  }

  async function getColorProfile(item, useImageScan) {
    if (!useImageScan || !item?.imageDataUrl) {
      const colorName = normalizeColorName(item?.color);
      return { source: 'manual', colorName, ...getColorMeta(colorName) };
    }

    if (!imageColorCache.has(item.id)) {
      imageColorCache.set(item.id, detectImageColor(item.imageDataUrl));
    }

    const detected = await imageColorCache.get(item.id);
    const colorName = normalizeColorName(detected || item.color);
    return { source: detected ? 'image' : 'manual', colorName, ...getColorMeta(colorName) };
  }

  async function enrichItems(items, useImageScan) {
    return Promise.all(items.map(async item => ({ ...item, aiColor: await getColorProfile(item, useImageScan) })));
  }

  function tagScore(item, tags) {
    const itemTags = (item.tags || []).map(tag => tag.toLowerCase());
    return tags.reduce((score, tag) => score + (itemTags.includes(tag) ? 1 : 0), 0);
  }

  function pairHarmonyScore(a, b, harmony) {
    const colorA = a.aiColor;
    const colorB = b.aiColor;
    if (!colorA || !colorB) return 0;
    if (colorA.neutral || colorB.neutral) return harmony === 'neutral-balance' ? 12 : 8;

    const distance = hueDistance(colorA.hue, colorB.hue);
    if (harmony === 'monochrome') return Math.max(0, 20 - distance / 4);
    if (harmony === 'analogous') return distance <= 45 ? 20 - distance / 3 : Math.max(0, 6 - distance / 30);
    if (harmony === 'complementary') {
      const differenceFromOpposite = Math.abs(180 - distance);
      return Math.max(0, 22 - differenceFromOpposite / 4);
    }
    if (harmony === 'neutral-balance') return colorA.neutral || colorB.neutral ? 14 : Math.max(0, 10 - distance / 10);
    return Math.max(0, 12 - Math.abs(90 - distance) / 10);
  }

  function chooseOptional(primary, optionalItems, harmony, filterColor) {
    if (!optionalItems.length) return [];
    const ranked = optionalItems
      .map(item => {
        let score = pairHarmonyScore(primary.top, item, harmony) + pairHarmonyScore(primary.bottom, item, harmony) + pairHarmonyScore(primary.shoes, item, harmony);
        if (filterColor !== 'any' && normalizeColorName(item.aiColor?.colorName || item.color) === filterColor) score += 4;
        return { item, score };
      })
      .sort((a, b) => b.score - a.score)
      .filter(entry => entry.score > 0);
    return ranked.slice(0, 2).map(entry => entry.item);
  }

  function itemList(combo) {
    return [combo.top, combo.bottom, combo.shoes, ...(combo.extras || [])].filter(Boolean);
  }

  function buildInsights(combo, harmony, occasion, style) {
    const items = itemList(combo);
    const colors = [...new Set(items.map(item => capitalize(item.aiColor.colorName)))];
    const neutralCount = items.filter(item => item.aiColor.neutral).length;
    const imageScanned = items.filter(item => item.aiColor.source === 'image').length;
    const insights = [
      `${capitalize(harmony.replace('-', ' '))} palette built from ${colors.join(', ')}.`,
      neutralCount >= 2 ? 'Neutrals keep the look grounded and wearable.' : 'The palette leans into stronger contrast for more visual energy.',
      `${capitalize(occasion)} + ${style} scoring favored tags like ${(styleRules[style] || []).slice(0, 2).join(' and ')}.`
    ];
    if (combo.extras?.length) insights.push(`Optional layer: ${combo.extras.map(item => item.name).join(' + ')}.`);
    if (imageScanned) insights.push(`Image color scan influenced ${imageScanned} item${imageScanned === 1 ? '' : 's'} in this suggestion.`);
    return insights;
  }

  function buildReason(combo, harmony, occasion, style) {
    const colors = itemList(combo).map(item => capitalize(item.aiColor.colorName));
    const theoryText = {
      monochrome: 'keeps the outfit in one color family',
      analogous: 'keeps neighboring colors smooth and cohesive',
      complementary: 'creates controlled contrast across the color wheel',
      'neutral-balance': 'uses neutrals to support one accent color',
      auto: 'balances harmony and contrast automatically'
    }[harmony] || 'balances the palette';

    const extras = combo.extras?.length ? ` Added ${combo.extras.map(item => item.name).join(' and ')} for styling depth.` : '';
    return `AI stylist chose ${combo.top.name}, ${combo.bottom.name}, and ${combo.shoes.name} because ${theoryText}. Dominant colors: ${colors.join(', ')}. This fits a ${style} ${occasion} look.${extras}`;
  }

  function scoreCombo(combo, filters) {
    const items = itemList(combo);
    const { harmony, occasion, style, preferredColor } = filters;
    const pairings = [
      pairHarmonyScore(combo.top, combo.bottom, harmony),
      pairHarmonyScore(combo.top, combo.shoes, harmony),
      pairHarmonyScore(combo.bottom, combo.shoes, harmony)
    ];
    let score = pairings.reduce((sum, value) => sum + value, 0);

    if (combo.extras?.length) score += combo.extras.reduce((sum, item) => sum + pairHarmonyScore(combo.top, item, harmony) / 2, 0);

    const rule = occasionRules[occasion] || occasionRules.everyday;
    score += items.reduce((sum, item) => sum + tagScore(item, rule.tags), 0) * 2 * rule.multiplier;
    score += items.reduce((sum, item) => sum + tagScore(item, styleRules[style] || []), 0) * 1.6;

    const uniqueColors = new Set(items.map(item => item.aiColor.colorName)).size;
    if (harmony === 'monochrome' && uniqueColors <= 2) score += 10;
    if (harmony === 'analogous' && uniqueColors <= 3) score += 6;
    if (harmony === 'neutral-balance') {
      const neutralCount = items.filter(item => item.aiColor.neutral).length;
      if (neutralCount >= 2) score += 12;
    }

    if (preferredColor !== 'any') {
      const matches = items.filter(item => item.aiColor.colorName === preferredColor).length;
      score += matches * 5;
    }

    if (style === 'layered' && combo.extras?.some(item => item.category === 'outerwear')) score += 10;
    if (occasion === 'office' && items.some(item => (item.tags || []).includes('dressy'))) score += 6;

    return Math.round(score * 10) / 10;
  }

  function dedupeSuggestions(suggestions) {
    const seen = new Set();
    return suggestions.filter(suggestion => {
      const key = suggestion.items.map(item => item.id).sort().join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  function renderPalette(combo) {
    const colors = itemList(combo).map(item => item.aiColor);
    paletteBar.innerHTML = colors.map(color => `
      <span class="palette-chip" style="background:${color.hex}; color:${color.colorName === 'white' ? '#222' : '#fff'}">${capitalize(color.colorName)}</span>
    `).join('');
  }

  function renderInsights(combo, insights) {
    insightList.innerHTML = insights.map(text => `<li>${text}</li>`).join('');
    renderPalette(combo);
  }

  function previewSuggestion(suggestion) {
    const [top, bottom, shoes] = suggestion.items;
    slots.top.innerHTML = top.imageDataUrl ? `<img src="${top.imageDataUrl}" alt="${top.name}" class="slot-image">` : top.icon;
    slots.bottom.innerHTML = bottom.imageDataUrl ? `<img src="${bottom.imageDataUrl}" alt="${bottom.name}" class="slot-image">` : bottom.icon;
    slots.shoes.innerHTML = shoes.imageDataUrl ? `<img src="${shoes.imageDataUrl}" alt="${shoes.name}" class="slot-image">` : shoes.icon;
    labels.top.textContent = `${top.name} · ${capitalize(top.aiColor.colorName)}`;
    labels.bottom.textContent = `${bottom.name} · ${capitalize(bottom.aiColor.colorName)}`;
    labels.shoes.textContent = `${shoes.name} · ${capitalize(shoes.aiColor.colorName)}`;
    title.textContent = suggestion.title;
    reason.textContent = suggestion.reason;
    aiConfidence.textContent = `${suggestion.confidence}% match`;
    renderInsights(suggestion.combo, suggestion.insights);

    currentOutfit = {
      id: suggestion.id,
      owner: user.username,
      name: suggestion.title,
      occasion: capitalize(suggestion.filters.occasion),
      caption: suggestion.reason,
      items: suggestion.items.map(item => item.id),
      createdAt: new Date().toISOString(),
      posted: false,
      boardIds: [],
      likes: 0,
      aiMeta: {
        harmony: suggestion.filters.harmony,
        style: suggestion.filters.style,
        confidence: suggestion.confidence,
        palette: suggestion.items.map(item => item.aiColor.colorName),
        insights: suggestion.insights
      }
    };

    sessionStorage.setItem('fashion_generated_outfit_v1', JSON.stringify(currentOutfit));
    if (previewLink) previewLink.href = 'outfit-detail.html?draft=1';
  }

  function renderSuggestions(suggestions) {
    if (!suggestions.length) {
      suggestionsList.innerHTML = '<p class="empty-suggestions">No strong outfit combinations were found. Try adding more wardrobe colors or switch to Surprise Me.</p>';
      return;
    }

    suggestionsList.innerHTML = suggestions.map((suggestion, index) => `
      <article class="suggestion-card ${index === 0 ? 'selected' : ''}" data-suggestion-id="${suggestion.id}">
        <div class="suggestion-head">
          <div>
            <h3>${suggestion.title}</h3>
            <p>${suggestion.confidence}% match · ${capitalize(suggestion.filters.harmony.replace('-', ' '))}</p>
          </div>
          <button class="mini-btn" type="button" data-action="use-look" data-suggestion-id="${suggestion.id}">Use this look</button>
        </div>
        <div class="suggestion-icons">${suggestion.items.map(item => `<span title="${item.name}">${item.icon}</span>`).join('')}</div>
        <p class="suggestion-copy">${suggestion.reason}</p>
      </article>
    `).join('');

    suggestionsList.querySelectorAll('[data-action="use-look"]').forEach(button => {
      button.addEventListener('click', () => {
        const suggestion = latestSuggestions.find(entry => entry.id === button.dataset.suggestionId);
        if (!suggestion) return;
        suggestionsList.querySelectorAll('.suggestion-card').forEach(card => card.classList.remove('selected'));
        button.closest('.suggestion-card')?.classList.add('selected');
        previewSuggestion(suggestion);
      });
    });
  }

  function autoHarmony(items) {
    const colorful = items.filter(item => !item.aiColor.neutral);
    if (!colorful.length) return 'neutral-balance';
    const hues = colorful.map(item => item.aiColor.hue).filter(hue => hue != null);
    if (!hues.length) return 'neutral-balance';
    const spread = Math.max(...hues) - Math.min(...hues);
    if (spread <= 20) return 'monochrome';
    if (spread <= 50) return 'analogous';
    return 'complementary';
  }

  async function generate(randomMode) {
    setStatus('Analyzing wardrobe colors and building AI outfit suggestions…');
    const items = await enrichItems(App.getUserItems(user.username), document.getElementById('useImageScan').checked);
    const tops = items.filter(i => i.category === 'tops');
    const bottoms = items.filter(i => i.category === 'bottoms');
    const shoes = items.filter(i => i.category === 'shoes');
    const outerwear = items.filter(i => i.category === 'outerwear');
    const accessories = items.filter(i => i.category === 'accessories');

    if (!tops.length || !bottoms.length || !shoes.length) {
      setStatus('Not enough wardrobe items to generate a complete outfit. Add at least a top, bottom, and shoes.', 'error');
      return;
    }

    const preferredColor = document.getElementById('colorPreference').value;
    const occasion = document.getElementById('occasionFilter').value;
    const style = document.getElementById('stylePreference').value;
    const selectedHarmony = document.getElementById('harmonyPreference').value;

    const sampleItems = [pick(tops), pick(bottoms), pick(shoes)].filter(Boolean);
    const harmony = randomMode ? pick(['monochrome', 'analogous', 'complementary', 'neutral-balance']) : (selectedHarmony === 'auto' ? autoHarmony(sampleItems) : selectedHarmony);

    let candidateTops = tops;
    let candidateBottoms = bottoms;
    let candidateShoes = shoes;
    if (preferredColor !== 'any' && !randomMode) {
      const filterByPreferred = list => {
        const filtered = list.filter(item => item.aiColor.colorName === preferredColor);
        return filtered.length ? filtered : list;
      };
      candidateTops = filterByPreferred(candidateTops);
      candidateBottoms = filterByPreferred(candidateBottoms);
      candidateShoes = filterByPreferred(candidateShoes);
    }

    const combinations = [];
    candidateTops.slice(0, 8).forEach(top => {
      candidateBottoms.slice(0, 8).forEach(bottom => {
        candidateShoes.slice(0, 8).forEach(shoe => {
          const combo = { top, bottom, shoes: shoe };
          const extras = chooseOptional(combo, [...outerwear, ...accessories], harmony, preferredColor);
          combo.extras = style === 'layered' || occasion === 'school' ? extras : extras.slice(0, 1);
          const score = scoreCombo(combo, { harmony, occasion, style, preferredColor });
          combinations.push({ combo, score });
        });
      });
    });

    const ranked = dedupeSuggestions(combinations.sort((a, b) => b.score - a.score).slice(0, 12).map((entry, index) => {
      const combo = entry.combo;
      const itemsForOutfit = [combo.top, combo.bottom, combo.shoes, ...(combo.extras || [])].filter(Boolean);
      const insights = buildInsights(combo, harmony, occasion, style);
      const confidence = Math.max(68, Math.min(98, Math.round(entry.score)));
      return {
        id: App.uid(`ai_look_${index}`),
        title: `${capitalize(occasion)} ${capitalize(harmony.replace('-', ' '))} Look`,
        combo,
        items: itemsForOutfit,
        score: entry.score,
        confidence,
        reason: buildReason(combo, harmony, occasion, style),
        insights,
        filters: { harmony, occasion, style, preferredColor }
      };
    })).slice(0, 3);

    latestSuggestions = ranked;
    renderSuggestions(ranked);

    if (!ranked.length) {
      setStatus('The AI stylist could not find a strong match. Try Surprise Me or add more wardrobe colors.', 'error');
      return;
    }

    previewSuggestion(ranked[0]);
    setStatus(`Generated ${ranked.length} AI outfit suggestion${ranked.length === 1 ? '' : 's'} using ${document.getElementById('useImageScan').checked ? 'image color scan + ' : ''}color theory.`, 'success');
  }

  generateBtn?.addEventListener('click', () => generate(false));
  surpriseBtn?.addEventListener('click', () => generate(true));
})();
