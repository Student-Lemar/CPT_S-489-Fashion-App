import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { itemsApi } from "../api/items";
import { outfitsApi } from "../api/outfits";

export default function Dashboard() {
  const { session } = useAuth();
  const [itemCount, setItemCount] = useState(0);
  const [outfitCount, setOutfitCount] = useState(0);

  useEffect(() => {
    Promise.all([itemsApi.list(), outfitsApi.list()])
      .then(([items, outfits]) => {
        setItemCount(items.length);
        setOutfitCount(outfits.length);
      })
      .catch(console.error);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = session?.displayName || session?.username || "";

  return (
    <div className="page">
      <div className="container">
        <div className="dashboard-welcome">
          <h1>
            {greeting}, <span className="highlight-text">{name}</span>!
          </h1>
          <p>Here's a snapshot of your wardrobe activity.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card card">
            <div className="stat-number">{itemCount}</div>
            <div className="stat-label">Wardrobe Items</div>
          </div>
          <div className="stat-card card">
            <div className="stat-number">{outfitCount}</div>
            <div className="stat-label">Saved Outfits</div>
          </div>
          <div className="stat-card card">
            <div className="stat-number">
              {session?.role === "creator" ? "Creator" : session?.role}
            </div>
            <div className="stat-label">Account Type</div>
          </div>
        </div>

        <div className="dashboard-actions">
          <Link className="action-card card" to="/wardrobe/add">
            <div className="action-icon">👕</div>
            <h2>Add Item</h2>
            <p>Upload a new piece to your wardrobe.</p>
          </Link>
          <Link className="action-card card" to="/outfit-generator">
            <div className="action-icon">✨</div>
            <h2>Generate Outfit</h2>
            <p>Let AI suggest your next look.</p>
          </Link>
          <Link className="action-card card" to="/saved-outfits">
            <div className="action-icon">🗂️</div>
            <h2>Saved Outfits</h2>
            <p>Browse and manage your outfits.</p>
          </Link>
          <Link className="action-card card" to="/profile">
            <div className="action-icon">👤</div>
            <h2>Update Profile</h2>
            <p>Edit your display name and bio.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
