import { Link } from "react-router-dom";
import "./Home.css";

function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <span className="pulse-dot"></span>
            Smart Campus Recovery Platform
          </div>

          <h1>
            Reuniting students with their lost items,
            <span> faster and smarter.</span>
          </h1>

          <p className="hero-description">
            CampusConnect is a full-stack lost and found platform that helps
            university students report items, search campus reports, submit
            verified claims, and discover smart matches automatically.
          </p>

          <div className="hero-actions">
            <Link to="/report-item" className="primary-button">
              Report an Item
            </Link>

            <Link to="/items" className="secondary-button">
              Browse Items
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>120+</strong>
              <span>Reports Managed</span>
            </div>

            <div>
              <strong>82%</strong>
              <span>Match Accuracy Demo</span>
            </div>

            <div>
              <strong>24/7</strong>
              <span>Campus Access</span>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="floating-card lost-card">
            <div className="card-label lost">Lost</div>
            <h3>Black Backpack</h3>
            <p>Main Library • Bags</p>
          </div>

          <div className="floating-card found-card">
            <div className="card-label found">Found</div>
            <h3>Casio Calculator</h3>
            <p>Engineering Lab • Electronics</p>
          </div>

          <div className="match-panel">
            <div className="match-header">
              <span className="pulse-dot green"></span>
              Smart Match Detected
            </div>

            <h2>Possible Match</h2>

            <p>
              The system compares category, location, keywords, and date to
              suggest related lost and found reports.
            </p>

            <div className="score-ring">
              <span>82%</span>
            </div>

            <div className="match-details">
              <span>Category Match</span>
              <strong>+30</strong>
            </div>

            <div className="match-details">
              <span>Location Similarity</span>
              <strong>+25</strong>
            </div>

            <div className="match-details">
              <span>Keyword Match</span>
              <strong>+27</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="workflow-section">
        <div className="section-header">
          <p>How It Works</p>
          <h2>A simple recovery process for the campus community</h2>
        </div>

        <div className="workflow-grid">
          <div className="workflow-card">
            <span>01</span>
            <h3>Report</h3>
            <p>
              Students submit lost or found item reports with category,
              location, date, and description.
            </p>
          </div>

          <div className="workflow-card">
            <span>02</span>
            <h3>Match</h3>
            <p>
              The smart matching system compares reports and suggests possible
              related items.
            </p>
          </div>

          <div className="workflow-card">
            <span>03</span>
            <h3>Claim</h3>
            <p>
              Users submit proof details to claim an item, preventing false
              ownership.
            </p>
          </div>

          <div className="workflow-card">
            <span>04</span>
            <h3>Recover</h3>
            <p>
              Item owners approve valid claims and the item status becomes
              recovered.
            </p>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <div className="feature-icon">🔐</div>
          <h3>Secure Login</h3>
          <p>
            JWT authentication protects user dashboards, item creation, claims,
            and admin-only routes.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🧠</div>
          <h3>Smart Matching</h3>
          <p>
            A rule-based score compares item category, location, keywords, and
            date closeness.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛡️</div>
          <h3>Admin Moderation</h3>
          <p>
            Admin users can manage accounts, approve item reports, and monitor
            platform statistics.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Home;