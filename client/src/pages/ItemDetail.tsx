import { useState, useEffect, type FormEvent } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { itemsApi } from '../api/items';
import { colorsApi } from '../api/colors';
import { getIconForCategory } from '../utils/helpers';
import type { Item, ItemCategory } from '../types';

const CATEGORIES: ItemCategory[] = ['tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
const COLORS = ['black', 'white', 'blue', 'gray', 'green', 'brown', 'pink'];

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = searchParams.get('mode') === 'edit';

  const [item, setItem] = useState<Item | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('tops');
  const [color, setColor] = useState('white');
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('');
  const [statusOk, setStatusOk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    if (!id) return;
    itemsApi
      .get(id)
      .then((fetched) => {
        setItem(fetched);
        setName(fetched.name);
        setCategory(fetched.category);
        setColor(fetched.color);
        setTagsInput((fetched.tags ?? []).join(', '));
        setNotes(fetched.notes ?? '');
      })
      .catch(() => setStatus('Item not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!item || !name || !category || !color) {
      setStatusOk(false); setStatus('Please complete the required fields.'); return;
    }
    setSubmitting(true);
    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const updated = await itemsApi.update(item.id, {
        name, category, color, tags, notes, icon: getIconForCategory(category),
      });
      setItem(updated);
      setStatusOk(true); setStatus('Item updated successfully.');
    } catch {
      setStatusOk(false); setStatus('Failed to save changes.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!item || !confirm(`Delete "${item.name}"?`)) return;
    await itemsApi.remove(item.id);
    navigate('/wardrobe');
  }

  async function handleExtractColor() {
    if (!item) return;
    if (!item.imageDataUrl) {
      setStatusOk(false); setStatus('No image uploaded — add an image first to extract its color.'); return;
    }
    setExtracting(true);
    try {
      const result = await colorsApi.extractColor(item.id);
      setItem((prev) => prev ? { ...prev, colorExtracted: result.colorExtracted } : prev);
      setStatusOk(true);
      setStatus(`Server extracted color: ${result.colorExtracted}`);
    } catch (err: unknown) {
      setStatusOk(false);
      setStatus(err instanceof Error ? err.message : 'Color extraction failed.');
    } finally {
      setExtracting(false);
    }
  }

  if (loading) return <div className="page"><div className="container">Loading…</div></div>;

  const icon = item ? getIconForCategory(category) : '👕';

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>{isEdit ? 'Edit Item' : 'Item Detail'}</h1>
            <p>{item?.name}</p>
          </div>
          <button className="back-link" onClick={() => navigate('/wardrobe')}>← Back to Wardrobe</button>
        </div>

        <section className="layout">
          {/* Preview */}
          <section className="card preview-card">
            <div className="upload-preview">
              {item?.imageDataUrl ? (
                <img
                  src={item.imageDataUrl}
                  alt={item.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '18px' }}
                />
              ) : (
                <span style={{ fontSize: '3rem' }}>{icon}</span>
              )}
            </div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className="color-badge">{color}</span>
              {item?.colorExtracted && (
                <span className="color-badge" style={{ background: '#f0fff4', color: '#1d7f45', borderColor: '#b7ebca' }}>
                  🎨 {item.colorExtracted} (extracted)
                </span>
              )}
              <span className="badge muted">{category}</span>
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ marginTop: '12px', fontSize: '13px', width: '100%' }}
              onClick={handleExtractColor}
              disabled={extracting || !item?.imageDataUrl}
              title={!item?.imageDataUrl ? 'Upload an image to enable color extraction' : 'Run server-side color extraction using Jimp'}
            >
              {extracting ? 'Extracting…' : '🎨 Extract Color from Image'}
            </button>
          </section>

          {/* Form */}
          <section className="card form-card">
            <form onSubmit={handleSave} noValidate>
              <div className="field">
                <label htmlFor="itemName">Item name *</label>
                <input
                  id="itemName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!isEdit}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="itemCategory">Category</label>
                <select
                  id="itemCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  disabled={!isEdit}
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="itemColor">Dominant color</label>
                <select
                  id="itemColor"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  disabled={!isEdit}
                >
                  {COLORS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="itemTags">Tags</label>
                <input
                  id="itemTags"
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  disabled={!isEdit}
                  placeholder="casual, daily"
                />
              </div>

              <div className="field">
                <label htmlFor="itemNotes">Notes</label>
                <textarea
                  id="itemNotes"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!isEdit}
                />
              </div>

              {status && (
                <p className={`status ${statusOk ? 'success' : 'error'}`} aria-live="polite">
                  {status}
                </p>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {isEdit ? (
                  <>
                    <button className="btn btn-primary" type="submit" disabled={submitting}>
                      {submitting ? 'Saving…' : 'Save Changes'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      type="button"
                      onClick={() => navigate(`/wardrobe/${encodeURIComponent(id!)}`)}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn"
                      type="button"
                      style={{ background: '#fee2e2', color: '#b42318' }}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={() => navigate(`/wardrobe/${encodeURIComponent(id!)}?mode=edit`)}
                  >
                    Edit Item
                  </button>
                )}
              </div>
            </form>
          </section>
        </section>
      </div>
    </div>
  );
}
