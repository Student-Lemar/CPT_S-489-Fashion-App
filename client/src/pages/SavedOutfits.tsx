import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { outfitsApi } from "../api/outfits";
import { formatDate } from "../utils/helpers";
import type { Outfit } from "../types";

export default function SavedOutfits() {
  const navigate = useNavigate();
  const [allOutfits, setAllOutfits] = useState<Outfit[]>([]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest First");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    outfitsApi
      .list()
      .then(setAllOutfits)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = (() => {
    const q = search.trim().toLowerCase();
    let data = allOutfits.filter(
      (o) =>
        !q ||
        o.name.toLowerCase().includes(q) ||
        (o.caption ?? "").toLowerCase().includes(q),
    );
    if (sort.includes("Newest"))
      data = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    if (sort.includes("Oldest"))
      data = [...data].sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    if (sort.includes("A-Z"))
      data = [...data].sort((a, b) => a.name.localeCompare(b.name));
    return data;
  })();

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
            <h1>Saved Outfits</h1>
            <p>
              {allOutfits.length} outfit{allOutfits.length === 1 ? "" : "s"}{" "}
              saved.
            </p>
          </div>
          <button
            className="primary-link"
            onClick={() => navigate("/outfit-generator")}
          >
            + Generate Outfit
          </button>
        </div>

        <div className="toolbar">
          <input
            className="search-input"
            type="search"
            placeholder="Search outfits…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option>Newest First</option>
            <option>Oldest First</option>
            <option>A-Z</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <p>
              No outfits saved yet.{" "}
              <button
                className="text-btn"
                onClick={() => navigate("/outfit-generator")}
              >
                Generate one →
              </button>
            </p>
          </div>
        ) : (
          <div
            className="outfits-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {filtered.map((outfit) => {
              const icons = outfit.itemIcons.length
                ? outfit.itemIcons
                : ["👕", "👖", "👟"];
              return (
                <div
                  key={outfit.id}
                  className="outfit-card card"
                  style={{ cursor: "pointer", padding: 0, overflow: "hidden" }}
                  onClick={() =>
                    navigate(`/outfit/${encodeURIComponent(outfit.id)}`)
                  }
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      background: "#f8f9fa",
                      padding: "16px",
                      gap: "6px",
                    }}
                  >
                    {icons.slice(0, 3).map((icon, i) => {
                      const img = outfit.itemImages?.[i];
                      return img ? (
                        <img
                          key={i}
                          src={img}
                          alt={icon}
                          style={{
                            width: "100%",
                            aspectRatio: "1",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                      ) : (
                        <span
                          key={i}
                          style={{ textAlign: "center", fontSize: "1.8rem" }}
                        >
                          {icon}
                        </span>
                      );
                    })}
                  </div>
                  <div style={{ padding: "12px 16px" }}>
                    <div
                      className="outfit-name"
                      style={{ fontWeight: 700, marginBottom: "4px" }}
                    >
                      {outfit.name}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: "12px",
                        fontSize: "12px",
                        color: "#888",
                      }}
                    >
                      <span>{icons.length} items</span>
                      <span>{formatDate(outfit.createdAt)}</span>
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
