import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { outfitsApi } from '../api/outfits';
import { boardsApi } from '../api/boards';
import type { Outfit } from '../types';

export default function OutfitDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isDraft = searchParams.get('draft') === '1';
  const navigate = useNavigate();

  const [outfit, setOutfit] = useState<Outfit | null>(null);
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('Everyday');
  const [caption, setCaption] = useState('');
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isDraft) {
      // Load from sessionStorage (generated draft)
      const raw = sessionStorage.getItem('fashion_generated_outfit_v1');
      if (raw) {
        const draft = JSON.parse(raw) as Outfit;
        setOutfit(draft);
        setName(draft.name); setOccasion(draft.occasion); setCaption(draft.caption ?? '');
      }
    } else if (id && id !== 'new') {
      outfitsApi.get(id).then((o) => {
        setOutfit(o);
        setName(o.name); setOccasion(o.occasion); setCaption(o.caption ?? '');
      }).catch(console.error);
    }
  }, [id, isDraft]);

  async function persist(posted: boolean) {
    setSaving(true);
    try {
      const payload = {
        name: name.trim() || 'Untitled Outfit',
        occasion,
        caption: caption.trim(),
        posted,
        items: outfit?.items ?? [],
        itemIcons: outfit?.itemIcons ?? [],
        boardIds: outfit?.boardIds ?? [],
        likes: outfit?.likes ?? 0,
        aiMeta: outfit?.aiMeta,
      };
      const saved = outfit && !isDraft && id && id !== 'new'
        ? await outfitsApi.update(id, payload)
        : await outfitsApi.create(payload);
      sessionStorage.removeItem('fashion_generated_outfit_v1');
      return saved;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    try {
      await persist(false);
      setStatusOk(true); setStatus('Outfit saved successfully.');
    } catch {
      setStatusOk(false); setStatus('Failed to save outfit.');
    }
  }

  async function handlePost() {
    try {
      const saved = await persist(true);
      const boards = await boardsApi.list();
      if (boards.length) {
        const board = boards[0];
        if (!board.outfitIds.includes(saved.id)) {
          await boardsApi.update(board.id, { outfitIds: [...board.outfitIds, saved.id] });
        }
        setStatusOk(true); setStatus(`Outfit posted to ${board.name}.`);
        setTimeout(() => navigate(`/boards/${encodeURIComponent(board.id)}`), 450);
      } else {
        setStatusOk(true); setStatus('Outfit saved. Create a board to post it.');
        setTimeout(() => navigate(`/boards/create?outfitId=${encodeURIComponent(saved.id)}`), 450);
      }
    } catch {
      setStatusOk(false); setStatus('Failed to post outfit.');
    }
  }

  const icons = outfit?.itemIcons ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Outfit Detail</h1>
            <p>{isDraft ? 'Review and save your generated outfit.' : 'Edit your outfit.'}</p>
          </div>
          <button className="back-link" onClick={() => navigate('/saved-outfits')}>← Back</button>
        </div>

        <section className="layout">
          {/* Preview */}
          <section className="card preview-card">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
              {icons.slice(0, 3).map((icon, i) => (
                <div key={i} style={{ background: '#f8f9fa', borderRadius: '12px', padding: '16px', textAlign: 'center', fontSize: '2rem' }}>
                  {icon}
                </div>
              ))}
            </div>
            {outfit?.aiMeta && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {outfit.aiMeta.palette?.map((c, i) => (
                  <span key={i} className="color-badge">{c}</span>
                ))}
              </div>
            )}
          </section>

          {/* Form */}
          <section className="card form-card">
            <form onSubmit={handleSave} noValidate>
              <div className="field">
                <label htmlFor="outfitName">Outfit name</label>
                <input
                  id="outfitName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="occasion">Occasion</label>
                <select id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                  {['Everyday', 'School', 'Office', 'Date Night', 'Streetwear'].map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="caption">Caption</label>
                <textarea
                  id="caption"
                  rows={3}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Describe your look…"
                />
              </div>

              {status && (
                <p className={`status ${statusOk ? 'success' : 'error'}`} aria-live="polite">
                  {status}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handlePost}
                  disabled={saving}
                >
                  Save & Post
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </div>
  );
}
