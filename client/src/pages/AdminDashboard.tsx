import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../api/admin";
import type { User, Report, AuditLogEntry } from "../types";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.listUsers(),
      adminApi.listReports(),
      adminApi.auditLog(),
    ])
      .then(([u, r, a]) => {
        setUsers(u);
        setReports(r);
        setAuditLog(a);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pending = reports.filter((r) => r.status === "pending").length;
  const active = users.filter(
    (u) => u.role === "creator" && u.status === "active",
  ).length;
  const suspended = users.filter((u) => u.status === "suspended").length;

  if (loading)
    return (
      <div className="page">
        <div className="container">Loading…</div>
      </div>
    );

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom: "28px" }}>
          {[
            { label: "Total Users", value: users.length },
            { label: "Active Creators", value: active },
            { label: "Pending Reports", value: pending },
            { label: "Suspended", value: suspended },
          ].map((s) => (
            <div key={s.label} className="stat-card card">
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick nav */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link className="btn btn-primary" to="/admin/users">
            Manage Users
          </Link>
          <Link className="btn btn-secondary" to="/admin/moderation">
            Moderation Queue
            {pending > 0 && (
              <span
                style={{
                  background: "#ff4d8d",
                  color: "#fff",
                  borderRadius: "12px",
                  padding: "1px 7px",
                  fontSize: "11px",
                  marginLeft: "6px",
                }}
              >
                {pending}
              </span>
            )}
          </Link>
        </div>

        {/* Recent audit log */}
        <section className="card" style={{ padding: "20px" }}>
          <h2
            style={{ fontSize: "16px", fontWeight: 700, marginBottom: "14px" }}
          >
            Recent Audit Log
          </h2>
          {auditLog.length === 0 ? (
            <p style={{ color: "#888" }}>No audit entries yet.</p>
          ) : (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #ececec",
                    textAlign: "left",
                  }}
                >
                  <th style={{ padding: "8px 12px", color: "#888" }}>Time</th>
                  <th style={{ padding: "8px 12px", color: "#888" }}>Admin</th>
                  <th style={{ padding: "8px 12px", color: "#888" }}>Action</th>
                  <th style={{ padding: "8px 12px", color: "#888" }}>Target</th>
                </tr>
              </thead>
              <tbody>
                {auditLog.slice(0, 5).map((entry) => (
                  <tr
                    key={entry.id}
                    style={{ borderBottom: "1px solid #f5f5f5" }}
                  >
                    <td style={{ padding: "8px 12px", color: "#888" }}>
                      {new Date(entry.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {entry.adminUsername}
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <span
                        style={{
                          background: "#f6f2ff",
                          color: "#6440d6",
                          borderRadius: "6px",
                          padding: "2px 8px",
                          fontSize: "11px",
                          fontWeight: 700,
                        }}
                      >
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ padding: "8px 12px" }}>{entry.target}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </div>
  );
}
