import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { feedApi } from "../api/feed";
import { reportsApi } from "../api/reports";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import type { FeedPost } from "../types";

const REASONS = [
  "Inappropriate content",
  "Spam or misleading",
  "Harassment or bullying",
  "Copyright infringement",
  "Other",
];

export default function Feed() {
  const { session } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Report modal state
  const [reportTarget, setReportTarget] = useState<FeedPost | null>(null);
  const [reportReason, setReportReason] = useState(REASONS[0]);
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [reportMsg, setReportMsg] = useState("");

  useEffect(() => {
    feedApi
      .list()
      .then(setPosts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    return q
      ? posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.creator.toLowerCase().includes(q) ||
            p.caption.toLowerCase().includes(q) ||
            p.tags.join(" ").toLowerCase().includes(q),
        )
      : posts;
  })();

  async function submitReport() {
    if (!reportTarget) return;
    setReportStatus("sending");
    try {
      await reportsApi.submit({
        type: "post",
        contentId: reportTarget.id,
        contentLabel: reportTarget.title,
        reason: reportReason,
      });
      setReportStatus("done");
      setReportMsg("Report submitted. Our moderation team will review it.");
    } catch (err) {
      setReportStatus("error");
      setReportMsg(err instanceof ApiError ? err.message : "Failed to submit report.");
    }
  }

  function closeModal() {
    setReportTarget(null);
    setReportReason(REASONS[0]);
    setReportStatus("idle");
    setReportMsg("");
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Public Feed</h1>
            <p>Discover outfits from the community.</p>
          </div>
        </div>

        <div className="toolbar" style={{ marginBottom: "20px" }}>
          <input
            className="search-input"
            type="search"
            placeholder="Search posts, creators, tags…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <p>Loading feed…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: "#888" }}>No public posts yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((post) => (
              <div key={post.id} className="card" style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <Link
                  to={`/creator/${encodeURIComponent(post.creator)}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <div
                    style={{
                      background: "#f8f9fa",
                      padding: "20px",
                      textAlign: "center",
                      fontSize: "2rem",
                    }}
                  >
                    {post.items.map((icon, i) => {
                      const img = post.itemImages?.[i];
                      return img ? (
                        <img
                          key={i}
                          src={img}
                          alt={icon}
                          style={{
                            width: "72px",
                            height: "72px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            margin: "2px",
                            display: "inline-block",
                          }}
                        />
                      ) : (
                        <span key={i} style={{ marginRight: "4px" }}>
                          {icon}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ padding: "14px" }}>
                    <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                      {post.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#888",
                        marginBottom: "6px",
                      }}
                    >
                      by @{post.creator} ·{" "}
                      {post.tags.map((t) => `#${t}`).join(" ")}
                    </div>
                    <p style={{ fontSize: "13px", color: "#555", margin: 0 }}>
                      {post.caption}
                    </p>
                  </div>
                </Link>
                {session && session.username !== post.creator && (
                  <div style={{ padding: "0 14px 12px", marginTop: "auto" }}>
                    <button
                      onClick={() => setReportTarget(post)}
                      style={{
                        background: "none",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "5px 10px",
                        fontSize: "12px",
                        color: "#888",
                        cursor: "pointer",
                      }}
                    >
                      🚩 Report
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report modal */}
      {reportTarget && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="card"
            style={{ width: "100%", maxWidth: "420px", padding: "28px", margin: "16px" }}
          >
            <h2 style={{ fontSize: "18px", fontWeight: 800, marginBottom: "4px" }}>Report Post</h2>
            <p style={{ color: "#888", fontSize: "13px", marginBottom: "16px" }}>
              "{reportTarget.title}" by @{reportTarget.creator}
            </p>

            {reportStatus === "done" || reportStatus === "error" ? (
              <>
                <p style={{ color: reportStatus === "done" ? "#1d7f45" : "#b42318", marginBottom: "16px" }}>
                  {reportMsg}
                </p>
                <button className="btn btn-secondary" onClick={closeModal}>Close</button>
              </>
            ) : (
              <>
                <div className="field" style={{ marginBottom: "16px" }}>
                  <label htmlFor="reportReason">Reason</label>
                  <select
                    id="reportReason"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  >
                    {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    className="btn btn-primary"
                    onClick={submitReport}
                    disabled={reportStatus === "sending"}
                  >
                    {reportStatus === "sending" ? "Submitting…" : "Submit Report"}
                  </button>
                  <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
