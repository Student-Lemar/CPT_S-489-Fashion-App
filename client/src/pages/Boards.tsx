import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { boardsApi } from "../api/boards";
import { outfitsApi } from "../api/outfits";
import { formatDate } from "../utils/helpers";
import type { Board, Outfit } from "../types";

export default function Boards() {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [outfitsMap, setOutfitsMap] = useState<Record<string, Outfit[]>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([boardsApi.list(), outfitsApi.list()])
      .then(([bds, outfits]) => {
        setBoards(bds);
        const map: Record<string, Outfit[]> = {};
        for (const b of bds) {
          map[b.id] = outfits.filter((o) => b.outfitIds.includes(o.id));
        }
        setOutfitsMap(map);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = boards.filter((b) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      b.name.toLowerCase().includes(q) ||
      (b.description ?? "").toLowerCase().includes(q)
    );
  });

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
          <div>
            <h1>My Boards</h1>
            <p>Organize your saved outfits into boards.</p>
          </div>
          <button
            className="primary-link"
            onClick={() => navigate("/boards/create")}
          >
            + New Board
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="search"
            placeholder="Search boards…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>
              No boards yet.{" "}
              <button
                className="text-btn"
                onClick={() => navigate("/boards/create")}
              >
                Create one →
              </button>
            </p>
          </div>
        ) : (
          <div
            className="boards-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((board) => {
              const boardOutfits = outfitsMap[board.id] ?? [];
              const icons = boardOutfits
                .flatMap((o) => o.itemIcons)
                .slice(0, 3);
              return (
                <article
                  key={board.id}
                  className="board-card card"
                  style={{ cursor: "pointer", padding: "18px" }}
                  onClick={() =>
                    navigate(`/boards/${encodeURIComponent(board.id)}`)
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <h2
                      style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}
                    >
                      {board.name}
                    </h2>
                    <span className={`badge ${board.visibility}`}>
                      {board.visibility}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#666",
                      marginBottom: "12px",
                    }}
                  >
                    {board.description || "No description yet."}
                  </p>
                  <div style={{ fontSize: "1.8rem", marginBottom: "10px" }}>
                    {icons.length ? (
                      icons.map((ic, i) => <span key={i}>{ic}</span>)
                    ) : (
                      <>🧥 👖 👟</>
                    )}
                  </div>
                  <p style={{ fontSize: "12px", color: "#888" }}>
                    {board.outfitIds.length} outfit
                    {board.outfitIds.length === 1 ? "" : "s"} •{" "}
                    {formatDate(board.createdAt)}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
