import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { boardsApi } from '../api/boards';
import { outfitsApi } from '../api/outfits';
import { profilesApi } from '../api/profiles';
import { formatDate } from '../utils/helpers';
import type { Board, Outfit, Profile } from '../types';

export default function BoardDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [posts, setPosts] = useState<Outfit[]>([]);
  const [ownerProfile, setOwnerProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    boardsApi
      .get(id)
      .then(async (b) => {
        setBoard(b);
        const [outfitResults, profile] = await Promise.all([
          Promise.all(b.outfitIds.map((oid) => outfitsApi.get(oid).catch(() => null))),
          profilesApi.get(b.ownerUsername),
        ]);
        setPosts(outfitResults.filter((o): o is Outfit => o !== null));
        setOwnerProfile(profile);
      })
      .catch(() => setError('Board not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><div className="container">Loading…</div></div>;
  if (error || !board) return <div className="page"><div className="container"><p className="status error">{error || 'Board not found.'}</p></div></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Board header */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <span className={`badge ${board.visibility}`} style={{ marginBottom: '8px', display: 'inline-block' }}>
                {board.visibility === 'public' ? '🌍 Public Board' : '🔒 Private Board'}
              </span>
              <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px' }}>{board.name}</h1>
              <p style={{ color: '#666', margin: 0 }}>{board.description || 'No description yet.'}</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/boards/create?edit=${encodeURIComponent(board.id)}`)}>
                Edit
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/saved-outfits')}>
                + Add Outfit
              </button>
            </div>
          </div>

          {ownerProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px' }}>
              <div
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  background: 'linear-gradient(135deg,#ff4d8d,#7c5cff)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '14px',
                }}
              >
                {(ownerProfile.displayName || ownerProfile.username).slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong>{ownerProfile.displayName || ownerProfile.username}</strong>
                <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Created {formatDate(board.createdAt)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Posts grid */}
        {posts.length === 0 ? (
          <p style={{ color: '#888' }}>No outfits on this board yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
            {posts.map((post) => {
              const icons = post.itemIcons.length ? post.itemIcons : ['👕', '👖', '👟'];
              return (
                <div key={post.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer' }} onClick={() => navigate(`/outfit/${encodeURIComponent(post.id)}`)}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f8f9fa', padding: '16px', gap: '6px' }}>
                    {icons.slice(0, 3).map((ic, i) => (
                      <span key={i} style={{ textAlign: 'center', fontSize: '1.8rem' }}>{ic}</span>
                    ))}
                  </div>
                  <div style={{ padding: '14px' }}>
                    <div style={{ fontWeight: 700, marginBottom: '4px' }}>{post.name}</div>
                    {post.caption && <p style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>{post.caption}</p>}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888' }}>
                      <span>❤️ {post.likes}</span>
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
