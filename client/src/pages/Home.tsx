import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { session } = useAuth();

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h1>
            Your Smart Wardrobe,
            <br />
            <span className="gradient-text">Styled by AI.</span>
          </h1>
          <p className="hero-sub">
            Upload your clothes, let the AI generate outfit combinations using
            color theory, and share your style with a community of creators.
          </p>
          <div className="hero-cta">
            {session ? (
              <Link className="btn btn-primary" to="/dashboard">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link className="btn btn-primary" to="/register">
                  Get Started Free
                </Link>
                <Link className="btn btn-secondary" to="/feed">
                  Browse the Feed
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">
            Everything you need for a smarter wardrobe
          </h2>
          <div className="features-grid">
            {[
              {
                icon: "👕",
                title: "Digital Wardrobe",
                desc: "Upload and organise every item you own with photo support and smart tags.",
              },
              {
                icon: "✨",
                title: "AI Outfit Generator",
                desc: "Let color theory guide outfit suggestions from your own wardrobe.",
              },
              {
                icon: "🗂️",
                title: "Inspiration Boards",
                desc: "Save and share your best looks on public or private boards.",
              },
              {
                icon: "👥",
                title: "Creator Community",
                desc: "Follow creators, discover new styles, and grow your fashion identity.",
              },
            ].map((f) => (
              <div key={f.title} className="feature-card card">
                <div style={{ fontSize: "2.2rem", marginBottom: "12px" }}>
                  {f.icon}
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA strip */}
      {!session && (
        <section className="cta-strip">
          <h2>Ready to build your smart wardrobe?</h2>
          <Link className="btn btn-primary" to="/register">
            Create a Free Account
          </Link>
        </section>
      )}
    </div>
  );
}
