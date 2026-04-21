import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { profilesApi } from '../api/profiles';
import { itemsApi } from '../api/items';
import { outfitsApi } from '../api/outfits';
import { followsApi } from '../api/follows';
import type { Profile } from '../types';

const DEFAULT_AVATAR =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="100%" height="100%" fill="%23333740"/><text x="50%" y="54%" font-size="72" text-anchor="middle" fill="%23ffffff" dominant-baseline="middle">👤</text></svg>';

export default function Profile() {
  const { session, refreshSession } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState('');
  const [itemCount, setItemCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!session) return;
    Promise.all([
      profilesApi.get(session.username),
      itemsApi.list(),
      outfitsApi.list(),
      followsApi.status(session.username),
    ])
      .then(([prof, items, outfits, fs]) => {
        setProfile(prof);
        setDisplayName(prof.displayName || '');
        setEmail(prof.email || `${session.username}@example.com`);
        setBio(prof.bio || '');
        setItemCount(items.length);
        setOutfitCount(outfits.length);
        setFollowerCount(fs.followerCount);
      })
      .catch(console.error);
  }, [session]);

  async function saveProfile(avatarDataUrl?: string | null) {
    if (!session) return;
    setSaving(true);
    try {
      await profilesApi.update(session.username, {
        displayName: displayName.trim(),
        email: email.trim(),
        bio: bio.trim(),
        ...(avatarDataUrl !== undefined ? { avatarDataUrl: avatarDataUrl ?? undefined } : {}),
      });
      await refreshSession();
      const updated = await profilesApi.get(session.username);
      setProfile(updated);
      setStatus('Changes saved.');
    } catch {
      setStatus('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  }

  function handleAvatarChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => saveProfile(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function handleReset() {
    if (!session) return;
    await profilesApi.update(session.username, { displayName: session.displayName, bio: '', email: `${session.username}@example.com`, avatarDataUrl: undefined });
    const updated = await profilesApi.get(session.username);
    setProfile(updated);
    setDisplayName(updated.displayName || '');
    setBio(updated.bio || '');
    setEmail(updated.email || '');
    setStatus('Reset complete.');
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await saveProfile();
  }

  if (!profile) return <div className="page"><div className="container">Loading…</div></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: '680px' }}>
        <div className="page-header">
          <div>
            <h1>My Profile</h1>
            <p>Update your account details.</p>
          </div>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          {/* Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
            <img
              src={profile.avatarDataUrl || DEFAULT_AVATAR}
              alt="Avatar"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ececec' }}
            />
            <div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                <button className="btn btn-secondary" onClick={() => fileRef.current?.click()}>Change Photo</button>
                <button className="btn btn-secondary" onClick={() => saveProfile(null)}>Remove</button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#888' }}>
                <span>{itemCount} items</span>
                <span>{outfitCount} outfits</span>
                <span>{followerCount} followers</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="displayName">Display name</label>
              <input id="displayName" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" value={session?.username ?? ''} disabled />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="bio">Bio</label>
              <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the community about your style…" />
            </div>

            {status && <p className="status success" aria-live="polite">{status}</p>}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
