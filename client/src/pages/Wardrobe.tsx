import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { itemsApi } from '../api/items';
import { formatDate, getIconForCategory } from '../utils/helpers';
import type { Item } from '../types';

const CATEGORIES = ['all', 'tops', 'bottoms', 'shoes', 'outerwear', 'accessories'];
const COLORS = ['all', 'black', 'white', 'blue', 'gray', 'green', 'brown', 'pink'];

export default function Wardrobe() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [color, setColor] = useState('all');
  const [sort, setSort] = useState('name-asc');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    itemsApi
      .list()
      .then(setAllItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useCallback(() => {
    const q = search.trim().toLowerCase();
    let items = allItems.filter((item) => {
      const matchQ = !q || item.name.toLowerCase().includes(q) || item.tags.some((t) => t.toLowerCase().includes(q));
      const matchC = category === 'all' || item.category === category;
      const matchColor = color === 'all' || item.color === color;
      return matchQ && matchC && matchColor;
    });

    if (sort === 'name-asc') items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'name-desc') items = [...items].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === 'recent') items = [...items].sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    return items;
  }, [allItems, search, category, color, sort]);

  const items = filtered();

  function clearFilters() {
    setSearch(''); setCategory('all'); setColor('all'); setSort('name-asc');
  }

  if (loading) return <div className="page"><div className="container">Loading wardrobe…</div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>My Wardrobe</h1>
            <p>Manage your clothing items.</p>
          </div>
          <Link className="primary-link" to="/wardrobe/add">+ Add Item</Link>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="search"
            placeholder="Search items or tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Categories' : c}</option>
            ))}
          </select>
          <select value={color} onChange={(e) => setColor(e.target.value)}>
            {COLORS.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'All Colors' : c}</option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="name-asc">Name A→Z</option>
            <option value="name-desc">Name Z→A</option>
            <option value="recent">Most Recent</option>
          </select>
          <button className="btn btn-secondary" onClick={clearFilters}>Clear</button>
        </div>

        <p className="results-text">{items.length} item{items.length === 1 ? '' : 's'}</p>

        {items.length === 0 ? (
          <div className="empty-state">
            <p>No items found. <Link to="/wardrobe/add">Add your first item →</Link></p>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {items.map((item) => (
              <article key={item.id} className="item-card card">
                <div className="item-thumb">
                  {item.imageDataUrl ? (
                    <img
                      src={item.imageDataUrl}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                    />
                  ) : (
                    getIconForCategory(item.category)
                  )}
                </div>
                <div className="item-body">
                  <div className="item-top">
                    <div>
                      <h2 className="item-name">{item.name}</h2>
                      <div className="item-category">{item.category}</div>
                    </div>
                    <span className="color-badge">{item.color}</span>
                  </div>
                  <div className="item-tags">
                    {item.tags.map((tag) => (
                      <span key={tag} className="item-tag">{tag}</span>
                    ))}
                  </div>
                  <div className="item-meta">{formatDate(item.addedAt)}</div>
                  <div className="item-actions">
                    <Link className="action-link" to={`/wardrobe/${encodeURIComponent(item.id)}`}>View</Link>
                    <Link className="action-link" to={`/wardrobe/${encodeURIComponent(item.id)}?mode=edit`}>Edit</Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
