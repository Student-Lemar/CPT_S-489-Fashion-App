import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { profilesApi } from "../api/profiles";
import { feedApi } from "../api/feed";
import { followsApi } from "../api/follows";
import { ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import type { Profile, FeedPost, FollowStatus } from "../types";

export default function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();

  // Keep usernames case-sensitive to match server storage/lookup.
  const handle = (username ?? "creator").replace(/^@/, "");

  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [followStatus, setFollowStatus] = useState<FollowStatus>({
    following: false,
    followerCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        // Canonicalize via the server's profile record. This avoids a broken state
        // when the URL casing doesn't match the stored username casing.
        const prof = await profilesApi.get(handle);
        if (cancelled) return;
        setProfile(prof);

        const [allPosts, fs] = await Promise.all([
          feedApi.list(),
          session ? followsApi.status(prof.username) : Promise.resolve(null),
        ]);
        if (cancelled) return;

        const canonical = String(prof.username).toLowerCase();
        setPosts(
          allPosts.filter(
            (p) => String(p.creator || "").toLowerCase() === canonical,
          ),
        );
        if (fs) setFollowStatus(fs);
      } catch (err) {
        if (cancelled) return;
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [handle, session]);

  async function handleFollow() {
    if (!session) {
      navigate(`/login?next=${encodeURIComponent(`/creator/${handle}`)}`);
      return;
    }
    try {
      const target = profile?.username ?? handle;
      if (followStatus.following) {
        const updated = await followsApi.unfollow(target);
        setFollowStatus(updated);
      } else {
        const updated = await followsApi.follow(target);
        setFollowStatus(updated);
      }
    } catch (err) {
      if (err instanceof ApiError) console.error(err.message);
    }
  }

  if (loading)
    return (
      <div className="page">
        <div className="container">Loading…</div>
      </div>
    );
  if (!profile)
    return (
      <div className="page">
        <div className="container">
          <p>Creator not found.</p>
        </div>
      </div>
    );

  const isSelf =
    !!session &&
    !!profile &&
    session.username.toLowerCase() === profile.username.toLowerCase();

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: "760px" }}>
        {/* Profile header */}
        <div
          className="card"
          style={{
            padding: "28px",
            marginBottom: "24px",
            display: "flex",
            gap: "20px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg,#ff4d8d,#7c5cff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: "28px",
              flexShrink: 0,
            }}
          >
            {profile.avatarDataUrl ? (
              <img
                src={profile.avatarDataUrl}
                alt={profile.displayName}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
            ) : (
              (profile.displayName || handle).slice(0, 1).toUpperCase()
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h1
              style={{ fontSize: "22px", fontWeight: 800, margin: "0 0 2px" }}
            >
              {profile.displayName || handle}
            </h1>
            <p style={{ color: "#888", margin: "0 0 8px", fontSize: "14px" }}>
              @{handle}
            </p>
            <p style={{ color: "#555", margin: "0 0 12px" }}>
              {profile.bio || "Public creator profile."}
            </p>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <button
                className="btn btn-primary"
                onClick={handleFollow}
                disabled={isSelf}
                style={{ minWidth: "100px" }}
              >
                {isSelf
                  ? "Your Profile"
                  : followStatus.following
                    ? "Following"
                    : "Follow"}
              </button>
              <span style={{ fontSize: "13px", color: "#888" }}>
                {followStatus.followerCount} follower
                {followStatus.followerCount === 1 ? "" : "s"}
              </span>
              {isSelf && (
                <span style={{ fontSize: "12px", color: "#999" }}>
                  You cannot follow yourself.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Posts */}
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
          Posts
        </h2>
        {posts.length === 0 ? (
          <p style={{ color: "#888" }}>No public posts yet.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                className="card"
                style={{ overflow: "hidden" }}
              >
                <div
                  style={{
                    background: "#f8f9fa",
                    padding: "16px",
                    textAlign: "center",
                    fontSize: "2rem",
                  }}
                >
                  {post.items.map((ic, i) => (
                    <span key={i}>{ic}</span>
                  ))}
                </div>
                <div style={{ padding: "12px" }}>
                  <div style={{ fontWeight: 700, marginBottom: "4px" }}>
                    {post.title}
                  </div>
                  <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
                    {post.caption}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
