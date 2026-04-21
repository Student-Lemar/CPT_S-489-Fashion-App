import { useState, useEffect } from 'react';
import { adminApi } from '../api/admin';
import type { User } from '../types';

export default function AdminUsers() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listUsers().then(setAllUsers).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function toggleUser(username: string) {
    const updated = await adminApi.toggleUserStatus(username);
    setAllUsers((prev) => prev.map((u) => (u.username === username ? updated : u)));
    if (modal?.username === username) setModal(updated);
  }

  const filtered = allUsers.filter((u) => {
    const q = search.trim().toLowerCase();
    return (
      (!roleFilter || u.role === roleFilter) &&
      (!statusFilter || u.status === statusFilter) &&
      (!q || u.username.toLowerCase().includes(q) || (u.displayName || '').toLowerCase().includes(q))
    );
  });

  if (loading) return <div className="page"><div className="container">Loading…</div></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>User Management</h1>
        </div>

        {/* Filters */}
        <div className="toolbar" style={{ marginBottom: '20px' }}>
          <input
            className="search-input"
            type="search"
            placeholder="Search username or display name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="creator">Creator</option>
            <option value="admin">Admin</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        <p style={{ fontSize: '13px', color: '#888', marginBottom: '12px' }}>
          Showing {filtered.length} user{filtered.length === 1 ? '' : 's'}
        </p>

        {/* Table */}
        <div className="card" style={{ overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ececec', textAlign: 'left' }}>
                {['Username', 'Display Name', 'Role', 'Status', 'Reports', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', color: '#888', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 14px', fontWeight: 600 }}>@{u.username}</td>
                  <td style={{ padding: '10px 14px' }}>{u.displayName || u.username}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        background: u.role === 'admin' ? '#fef3c7' : '#f0f9ff',
                        color: u.role === 'admin' ? '#92400e' : '#0369a1',
                        borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span
                      style={{
                        background: u.status === 'active' ? '#dcfce7' : '#fee2e2',
                        color: u.status === 'active' ? '#166534' : '#b42318',
                        borderRadius: '6px', padding: '2px 8px', fontSize: '11px', fontWeight: 700,
                      }}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>{u.reports}</td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ fontSize: '12px', padding: '4px 10px' }}
                        onClick={() => setModal(u)}
                      >
                        View
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          className="btn"
                          style={{
                            fontSize: '12px', padding: '4px 10px',
                            background: u.status === 'active' ? '#fee2e2' : '#dcfce7',
                            color: u.status === 'active' ? '#b42318' : '#166534',
                            border: 'none', borderRadius: '8px', cursor: 'pointer',
                          }}
                          onClick={() => toggleUser(u.username)}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p style={{ textAlign: 'center', padding: '24px', color: '#888' }}>No users match your filters.</p>
          )}
        </div>

        {/* Modal */}
        {modal && (
          <div
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
            onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
          >
            <div className="card" style={{ padding: '28px', width: '360px', maxWidth: '90vw' }}>
              <h2 style={{ margin: '0 0 16px', fontSize: '18px' }}>@{modal.username}</h2>
              {[
                ['Display Name', modal.displayName],
                ['Role', modal.role],
                ['Status', modal.status],
                ['Reports', modal.reports],
              ].map(([label, value]) => (
                <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f5f5f5', fontSize: '14px' }}>
                  <span style={{ color: '#888' }}>{label}</span>
                  <span style={{ fontWeight: 600 }}>{String(value)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                {modal.role !== 'admin' && (
                  <button
                    className="btn btn-primary"
                    onClick={() => toggleUser(modal.username)}
                    style={{ flex: 1 }}
                  >
                    {modal.status === 'active' ? 'Suspend Account' : 'Reactivate Account'}
                  </button>
                )}
                <button className="btn btn-secondary" onClick={() => setModal(null)} style={{ flex: 1 }}>Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
