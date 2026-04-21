import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { colorsApi } from '../api/colors';
import { capitalize } from '../utils/helpers';
import { COLOR_MAP } from '../utils/colorUtils';
import type { AiSuggestion, EnrichedItem, OutfitCombo, HarmonyMode, OccasionMode, StyleMode } from '../types';

const HARMONIES: HarmonyMode[] = ['monochrome', 'analogous', 'complementary', 'neutral-balance'];
const OCCASIONS: OccasionMode[] = ['everyday', 'school', 'office', 'date-night', 'streetwear'];
const STYLES: StyleMode[] = ['balanced', 'minimal', 'casual', 'layered'];
const COLORS = ['any', ...Object.keys(COLOR_MAP)];

/** Reconstruct a combo object (top/bottom/shoes/extras) from a flat items array. */
function buildCombo(items: EnrichedItem[]): OutfitCombo {
  const get = (cat: string) => items.find((i) => i.category === cat) as EnrichedItem;
  const extras = items.filter((i) => i.category === 'outerwear' || i.category === 'accessories');
  return { top: get('tops'), bottom: get('bottoms'), shoes: get('shoes'), extras };
}

/** Build a human-readable reason string from server suggestion data. */
function buildReason(items: EnrichedItem[], harmony: string, occasion: string, style: string): string {
  const top = items.find((i) => i.category === 'tops');
  const bottom = items.find((i) => i.category === 'bottoms');
  const shoes = items.find((i) => i.category === 'shoes');
  const colors = [...new Set(items.map((i) => capitalize(i.aiColor.colorName)))];
  const theory: Record<string, string> = {
    monochrome: 'keeps the outfit in one color family',
    analogous: 'keeps neighboring colors smooth and cohesive',
    complementary: 'creates controlled contrast across the color wheel',
    'neutral-balance': 'uses neutrals to support one accent color',
  };
  const extras = items.filter((i) => i.category === 'outerwear' || i.category === 'accessories');
  return `AI stylist chose ${top?.name}, ${bottom?.name}, and ${shoes?.name} because ${theory[harmony] ?? 'balances the palette'}. Dominant colors: ${colors.join(', ')}. Fits a ${style} ${occasion} look.${extras.length ? ` Added ${extras.map((i) => i.name).join(' and ')} for styling depth.` : ''}`;
}

/** Build insight bullet points from server suggestion data. */
function buildInsights(items: EnrichedItem[], harmony: string, occasion: string): string[] {
  const colors = [...new Set(items.map((i) => capitalize(i.aiColor.colorName)))];
  const neutralCount = items.filter((i) => i.aiColor.neutral).length;
  const imageScanned = items.filter((i) => i.aiColor.source === 'image').length;
  return [
    `${capitalize(harmony.replace('-', ' '))} palette from ${colors.join(', ')}.`,
    neutralCount >= 2 ? 'Neutrals keep the look grounded.' : 'The palette uses contrast for visual energy.',
    imageScanned ? `Image color scan influenced ${imageScanned} item${imageScanned === 1 ? '' : 's'}.` : 'Colors sourced from item labels.',
    `Tuned for a ${occasion} setting.`,
  ];
}

/** Convert a server suggestion into the client AiSuggestion shape. */
function toAiSuggestion(
  s: { rank: number; score: number; harmony: string; items: EnrichedItem[]; label: string },
  filters: { harmony: string; occasion: OccasionMode; style: StyleMode; preferredColor: string },
): AiSuggestion {
  const combo = buildCombo(s.items);
  const confidence = Math.max(68, Math.min(98, Math.round(s.score)));
  return {
    id: `ai_${s.rank}_${Date.now()}`,
    title: `${capitalize(filters.occasion)} ${capitalize(s.harmony.replace('-', ' '))} Look`,
    combo,
    items: s.items,
    score: s.score,
    confidence,
    reason: buildReason(s.items, s.harmony, filters.occasion, filters.style),
    insights: buildInsights(s.items, s.harmony, filters.occasion),
    filters: { ...filters, harmony: s.harmony },
  };
}

function comboItems(combo: OutfitCombo): EnrichedItem[] {
  return [combo.top, combo.bottom, combo.shoes, ...(combo.extras ?? [])].filter(Boolean);
}

export default function OutfitGenerator() {
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState<AiSuggestion[]>([]);
  const [selected, setSelected] = useState<AiSuggestion | null>(null);
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Filter state
  const [harmony, setHarmony] = useState<HarmonyMode>('auto' as HarmonyMode);
  const [occasion, setOccasion] = useState<OccasionMode>('everyday');
  const [style, setStyle] = useState<StyleMode>('balanced');
  const [preferredColor, setPreferredColor] = useState('any');
  const [useImageColors, setUseImageColors] = useState(false);

  async function generate(randomMode: boolean) {
    setGenerating(true);
    setSuggestions([]);
    setSelected(null);
    setStatus('Asking the server to analyse your wardrobe colors and build suggestions…');
    setStatusOk(false);
    try {
      const filters = randomMode
        ? {
            harmony: 'auto' as const,
            occasion: OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)],
            style: STYLES[Math.floor(Math.random() * STYLES.length)],
            preferredColor: 'any',
            useImageColors,
          }
        : { harmony: harmony === ('auto' as HarmonyMode) ? 'auto' as const : harmony, occasion, style, preferredColor, useImageColors };

      const result = await colorsApi.generate({ ...filters, maxSuggestions: 3 });

      const activeOccasion: OccasionMode = (filters.occasion as OccasionMode) ?? 'everyday';
      const activeStyle: StyleMode = (filters.style as StyleMode) ?? 'balanced';

      const mapped = result.suggestions.map((s) =>
        toAiSuggestion(s as { rank: number; score: number; harmony: string; items: EnrichedItem[]; label: string }, {
          harmony: s.harmony,
          occasion: activeOccasion,
          style: activeStyle,
          preferredColor: filters.preferredColor ?? 'any',
        }),
      );

      setSuggestions(mapped);
      if (mapped.length) {
        setSelected(mapped[0]);
        sessionStorage.setItem('fashion_generated_outfit_v1', JSON.stringify(buildDraft(mapped[0])));
        setStatus(`Generated ${mapped.length} suggestion${mapped.length === 1 ? '' : 's'}.`);
        setStatusOk(true);
      } else {
        setStatus('Not enough wardrobe items. Add at least a top, bottom, and shoes.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Generation failed.';
      setStatus(msg);
    } finally {
      setGenerating(false);
    }
  }

  function buildDraft(suggestion: AiSuggestion) {
    return {
      id: suggestion.id,
      name: suggestion.title,
      occasion: capitalize(suggestion.filters.occasion),
      caption: suggestion.reason,
      items: suggestion.items.map((i) => i.id),
      itemIcons: suggestion.items.map((i) => i.icon ?? '👕'),
      posted: false,
      boardIds: [],
      likes: 0,
      createdAt: new Date().toISOString(),
      aiMeta: {
        harmony: suggestion.filters.harmony,
        style: suggestion.filters.style,
        confidence: suggestion.confidence,
        palette: suggestion.items.map((i) => i.aiColor.colorName),
        insights: suggestion.insights,
      },
    };
  }

  function selectSuggestion(s: AiSuggestion) {
    setSelected(s);
    sessionStorage.setItem('fashion_generated_outfit_v1', JSON.stringify(buildDraft(s)));
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Outfit Generator</h1>
            <p>AI-powered outfit suggestions from your wardrobe.</p>
          </div>
        </div>

        {/* Controls */}
        <div className="card generator-controls" style={{ padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px', marginBottom: '14px' }}>
            <div className="field">
              <label>Harmony</label>
              <select value={harmony} onChange={(e) => setHarmony(e.target.value as HarmonyMode)}>
                <option value="auto">Auto</option>
                {HARMONIES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Occasion</label>
              <select value={occasion} onChange={(e) => setOccasion(e.target.value as OccasionMode)}>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Style</label>
              <select value={style} onChange={(e) => setStyle(e.target.value as StyleMode)}>
                {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Preferred color</label>
              <select value={preferredColor} onChange={(e) => setPreferredColor(e.target.value)}>
                {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useImageColors}
              onChange={(e) => setUseImageColors(e.target.checked)}
            />
            Use image color scan — server will extract colors from item photos (slower)
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-primary" onClick={() => generate(false)} disabled={generating}>
              {generating ? 'Generating…' : '✨ Generate'}
            </button>
            <button className="btn btn-secondary" onClick={() => generate(true)} disabled={generating}>
              🎲 Surprise Me
            </button>
          </div>
        </div>

        {status && (
          <p className={`status ${statusOk ? 'success' : ''}`} aria-live="polite" style={{ marginBottom: '16px' }}>
            {status}
          </p>
        )}

        <div className="generator-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '20px' }}>
          {/* Suggestions list */}
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Suggestions</h2>
            {suggestions.length === 0 && (
              <p style={{ color: '#888' }}>Generate to see suggestions here.</p>
            )}
            {suggestions.map((s, idx) => (
              <article
                key={s.id}
                className={`card suggestion-card ${selected?.id === s.id ? 'selected' : ''}`}
                style={{ padding: '14px', marginBottom: '12px', cursor: 'pointer', border: selected?.id === s.id ? '2px solid #ff4d8d' : '1px solid #ececec' }}
                onClick={() => selectSuggestion(s)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', fontWeight: 700, margin: 0 }}>#{idx + 1} {s.title}</h3>
                    <p style={{ fontSize: '12px', color: '#888', margin: '2px 0 0' }}>
                      {s.confidence}% match · {s.filters.harmony}
                    </p>
                  </div>
                </div>
                <div style={{ marginTop: '8px', fontSize: '22px' }}>
                  {s.items.slice(0, 3).map((i) => <span key={i.id} title={i.name}>{i.icon ?? '👕'}</span>)}
                </div>
              </article>
            ))}
          </div>

          {/* Selected preview */}
          {selected && (
            <div className="card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '4px' }}>{selected.title}</h2>
              <p style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>{selected.confidence}% match</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
                {[selected.combo.top, selected.combo.bottom, selected.combo.shoes].map((item, i) => (
                  <div key={i} style={{ textAlign: 'center' }}>
                    <div
                      className="slot"
                      style={{ fontSize: '2.5rem', background: '#f8f9fa', borderRadius: '12px', padding: '12px', marginBottom: '4px' }}
                    >
                      {item.imageDataUrl ? (
                        <img src={item.imageDataUrl} alt={item.name} style={{ width: '100%', borderRadius: '8px' }} />
                      ) : (
                        item.icon ?? '👕'
                      )}
                    </div>
                    <p style={{ fontSize: '12px', fontWeight: 600, margin: 0 }}>
                      {item.name} · {capitalize(item.aiColor.colorName)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Palette */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '12px', flexWrap: 'wrap' }}>
                {comboItems(selected.combo).map((item, i) => (
                  <span
                    key={i}
                    className="palette-chip"
                    style={{
                      background: item.aiColor.hex,
                      color: item.aiColor.colorName === 'white' ? '#222' : '#fff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 600,
                    }}
                  >
                    {capitalize(item.aiColor.colorName)}
                  </span>
                ))}
              </div>

              <p style={{ fontSize: '13px', color: '#555', marginBottom: '12px' }}>{selected.reason}</p>

              <ul style={{ paddingLeft: '16px', fontSize: '13px', color: '#666', marginBottom: '16px' }}>
                {selected.insights.map((ins, i) => <li key={i}>{ins}</li>)}
              </ul>

              <button
                className="btn btn-primary"
                onClick={() => navigate('/outfit/new?draft=1')}
                style={{ width: '100%' }}
              >
                Save this outfit →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
