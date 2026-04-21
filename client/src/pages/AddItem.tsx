import { useState, useRef, type FormEvent, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { itemsApi } from "../api/items";
import { colorsApi } from "../api/colors";
import { getIconForCategory } from "../utils/helpers";
import type { ItemCategory } from "../types";

const CATEGORIES: ItemCategory[] = [
  "tops",
  "bottoms",
  "shoes",
  "outerwear",
  "accessories",
];
const COLORS = ["black", "white", "blue", "gray", "green", "brown", "pink"];

export default function AddItem() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<ItemCategory>("tops");
  const [color, setColor] = useState("white");
  const [tagsInput, setTagsInput] = useState("");
  const [notes, setNotes] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [statusOk, setStatusOk] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setImageDataUrl(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setImageDataUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleReset() {
    setName("");
    setCategory("tops");
    setColor("white");
    setTagsInput("");
    setNotes("");
    setImageDataUrl(null);
    setStatus("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name || !category || !color) {
      setStatusOk(false);
      setStatus(
        "Please complete the required fields: item name, category, and dominant color.",
      );
      return;
    }
    setSubmitting(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const created = await itemsApi.create({
        name,
        category,
        color,
        icon: getIconForCategory(category),
        tags,
        notes,
        imageDataUrl: imageDataUrl ?? undefined,
        addedAt: new Date().toISOString(),
      });
      // If an image was uploaded, trigger server-side color extraction in the background
      if (imageDataUrl && created.id) {
        colorsApi.extractColor(created.id).catch(() => {
          /* non-critical */
        });
      }
      setStatusOk(true);
      setStatus("Item saved. Redirecting…");
      setTimeout(() => navigate("/wardrobe"), 500);
    } catch (err) {
      setStatusOk(false);
      setStatus("Failed to save item. Please try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1>Add Item</h1>
            <p>Upload a new clothing item to your wardrobe.</p>
          </div>
          <button className="back-link" onClick={() => navigate("/wardrobe")}>
            ← Back to Wardrobe
          </button>
        </div>

        <section className="layout">
          {/* Preview */}
          <section className="card preview-card">
            <div
              id="uploadPreview"
              className="upload-preview"
              onClick={() => fileRef.current?.click()}
              style={{ cursor: "pointer" }}
              aria-label="Click to upload image"
            >
              {imageDataUrl ? (
                <img src={imageDataUrl} alt="Preview" />
              ) : (
                <span style={{ fontSize: "3rem" }}>
                  {getIconForCategory(category)}
                </span>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => fileRef.current?.click()}
              style={{ marginTop: "12px", width: "100%" }}
            >
              {imageDataUrl ? "Change Photo" : "Upload Photo"}
            </button>
          </section>

          {/* Form */}
          <section className="card form-card">
            <form onSubmit={handleSubmit} noValidate>
              <div className="field">
                <label htmlFor="itemName">Item name *</label>
                <input
                  id="itemName"
                  type="text"
                  placeholder="e.g. White Tee"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="itemCategory">Category *</label>
                <select
                  id="itemCategory"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="itemColor">Dominant color *</label>
                <select
                  id="itemColor"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  {COLORS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="itemTags">Tags (comma-separated)</label>
                <input
                  id="itemTags"
                  type="text"
                  placeholder="casual, daily, basic"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="itemNotes">Notes</label>
                <textarea
                  id="itemNotes"
                  rows={3}
                  placeholder="Optional notes about fit, care, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              {status && (
                <p
                  className={`status ${statusOk ? "success" : "error"}`}
                  aria-live="polite"
                >
                  {status}
                </p>
              )}

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Saving…" : "Save Item"}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  onClick={handleReset}
                >
                  Reset
                </button>
              </div>
            </form>
          </section>
        </section>
      </div>
    </div>
  );
}
