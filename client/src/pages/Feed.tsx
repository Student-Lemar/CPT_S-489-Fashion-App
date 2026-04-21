import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { feedApi } from "../api/feed";
import type { FeedPost } from "../types";

export default function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

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
              <Link
                key={post.id}
                className="card"
                to={`/creator/${encodeURIComponent(post.creator)}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "20px",
                    textAlign: "center",
                    fontSize: "2rem",
                  }}
                >
                  {post.items.map((icon, i) => (
                    <span key={i} style={{ marginRight: "4px" }}>
                      {icon}
                    </span>
                  ))}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
