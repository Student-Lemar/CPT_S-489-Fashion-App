import { useState, type FormEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { boardsApi } from "../api/boards";
import { outfitsApi } from "../api/outfits";
import { useAuth } from "../context/AuthContext";
import type { BoardVisibility } from "../types";

export default function CreateBoard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { session } = useAuth();
  const outfitId = searchParams.get("outfitId");

  const [boardName, setBoardName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<BoardVisibility>("private");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!boardName.trim()) {
      setError("Board name is required.");
      return;
    }
    setSubmitting(true);
    try {
      const board = await boardsApi.create({
        name: boardName.trim(),
        description: description.trim(),
        visibility,
        outfitIds: outfitId ? [outfitId] : [],
      });
      // If an outfit was linked, mark it posted if board is public
      if (outfitId && visibility === "public") {
        try {
          const outfit = await outfitsApi.get(outfitId);
          await outfitsApi.update(outfit.id, {
            posted: true,
            boardIds: [...new Set([...(outfit.boardIds ?? []), board.id])],
          });
        } catch {
          /* non-critical */
        }
      }
      navigate(`/boards/${encodeURIComponent(board.id)}`);
    } catch {
      setError("Failed to create board. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "560px" }}>
        <div className="page-header">
          <div>
            <h1>Create Board</h1>
            <p>Organize your outfits into a board.</p>
          </div>
          <button className="back-link" onClick={() => navigate("/boards")}>
            ← Back to Boards
          </button>
        </div>

        <section className="card" style={{ padding: "28px" }}>
          <form onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="board-name">Board name *</label>
              <input
                id="board-name"
                type="text"
                placeholder="e.g. Weekend Fits"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label htmlFor="board-desc">Description</label>
              <textarea
                id="board-desc"
                rows={3}
                placeholder="What's this board about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="field">
              <label>Visibility</label>
              <div style={{ display: "flex", gap: "12px" }}>
                {(["private", "public"] as BoardVisibility[]).map((v) => (
                  <label
                    key={v}
                    className={`radio-card ${visibility === v ? "selected" : ""}`}
                    style={{
                      flex: 1,
                      padding: "12px",
                      border: `2px solid ${visibility === v ? "#ff4d8d" : "#ececec"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontWeight: visibility === v ? 700 : 400,
                    }}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value={v}
                      checked={visibility === v}
                      onChange={() => setVisibility(v)}
                      style={{ accentColor: "#ff4d8d" }}
                      disabled={v === "public" && session?.role !== "creator"}
                    />
                    {v === "private" ? "🔒 Private" : "🌍 Public"}
                  </label>
                ))}
              </div>
              {session?.role !== "creator" && (
                <p
                  style={{ fontSize: "12px", color: "#888", marginTop: "4px" }}
                >
                  Only Creator accounts can create public boards.
                </p>
              )}
            </div>

            {error && <p className="status error">{error}</p>}

            <button
              className="btn btn-primary"
              type="submit"
              disabled={submitting}
              style={{ width: "100%" }}
            >
              {submitting ? "Creating…" : "Create Board"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
