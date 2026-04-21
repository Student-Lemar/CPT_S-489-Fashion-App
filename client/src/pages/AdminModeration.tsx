import { useState, useEffect } from "react";
import { adminApi } from "../api/admin";
import { formatDate } from "../utils/helpers";
import type { Report, ReportStatus } from "../types";

const ACTION_LABELS: Record<string, string> = {
  remove: "Remove",
  hide: "Hide",
  warn: "Warn User",
  noaction: "No Action",
};

export default function AdminModeration() {
  const [reports, setReports] = useState<Report[]>([]);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .listReports()
      .then(setReports)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  async function takeAction(id: string, action: string) {
    const report = reports.find((r) => r.id === id);
    if (!report) return;

    const messages: Record<string, string> = {
      remove: `${report.contentLabel} removed from public views.`,
      hide: `${report.contentLabel} hidden pending review.`,
      warn: `@${report.posterUsername} has been warned.`,
      noaction: `Report dismissed for ${report.contentLabel}.`,
    };

    let newStatus: ReportStatus;
    if (action === "remove") newStatus = "removed";
    else if (action === "hide") newStatus = "hidden";
    else newStatus = "resolved";

    try {
      const updated = await adminApi.updateReport(id, newStatus);
      if (action === "warn") await adminApi.warnUser(report.posterUsername);
      setReports((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(messages[action] ?? "Done.");
    } catch {
      showToast("Action failed.");
    }
  }

  const filtered = reports.filter((r) => {
    return (
      (!typeFilter || r.type === typeFilter) &&
      (!statusFilter || r.status === statusFilter)
    );
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

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
          <h1>Moderation Queue</h1>
          <p style={{ color: "#888", fontSize: "13px" }}>
            {pendingCount} item{pendingCount === 1 ? "" : "s"} pending review
          </p>
        </div>

        {/* Filters */}
        <div className="toolbar" style={{ marginBottom: "20px" }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="post">Posts</option>
            <option value="board">Boards</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="removed">Removed</option>
            <option value="hidden">Hidden</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p style={{ color: "#888" }}>No reports match your filters.</p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "14px" }}
          >
            {filtered.map((report) => (
              <div
                key={report.id}
                className="card"
                style={{
                  padding: "18px",
                  opacity: report.status !== "pending" ? 0.65 : 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      background:
                        report.type === "post" ? "#fef0f6" : "#f0f9ff",
                      color: report.type === "post" ? "#bf3c72" : "#0369a1",
                      borderRadius: "6px",
                      padding: "2px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    {report.type}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: "14px" }}>
                    {report.contentLabel}
                  </span>
                  <span style={{ fontSize: "12px", color: "#888" }}>
                    Reported {formatDate(report.createdAt)}
                  </span>
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "11px",
                      fontWeight: 700,
                      color:
                        report.status === "pending" ? "#92400e" : "#166534",
                      background:
                        report.status === "pending" ? "#fef3c7" : "#dcfce7",
                      borderRadius: "6px",
                      padding: "2px 8px",
                    }}
                  >
                    {report.status}
                  </span>
                </div>

                <div style={{ fontSize: "14px", marginBottom: "10px" }}>
                  <p style={{ margin: "0 0 4px" }}>
                    Posted by: <strong>@{report.posterUsername}</strong>
                  </p>
                  <p style={{ margin: "0 0 4px" }}>
                    <strong>Reason:</strong> {report.reason}
                  </p>
                  <p style={{ margin: 0, color: "#666", fontStyle: "italic" }}>
                    "{report.caption}"
                  </p>
                </div>

                {report.status === "pending" && (
                  <div
                    style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}
                  >
                    {Object.entries(ACTION_LABELS).map(([action, label]) => (
                      <button
                        key={action}
                        className="btn"
                        style={{
                          fontSize: "12px",
                          padding: "5px 12px",
                          borderRadius: "8px",
                          border: "none",
                          cursor: "pointer",
                          background:
                            action === "remove"
                              ? "#fee2e2"
                              : action === "hide"
                                ? "#fef3c7"
                                : action === "warn"
                                  ? "#fff7ed"
                                  : "#f0f9ff",
                          color:
                            action === "remove"
                              ? "#b42318"
                              : action === "hide"
                                ? "#92400e"
                                : action === "warn"
                                  ? "#c2410c"
                                  : "#0369a1",
                          fontWeight: 700,
                        }}
                        onClick={() => takeAction(report.id, action)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                {report.status !== "pending" && (
                  <span
                    style={{
                      color: "#166534",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    ✓ Resolved
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Toast */}
        {toast && (
          <div
            style={{
              position: "fixed",
              bottom: "24px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "#1e1e1e",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: 600,
              zIndex: 1000,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
