import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <main className="not-found-page">
      <section className="not-found-card">
        <p className="not-found-code">404</p>
        <h1>Page Not Found</h1>
        <p>
          The page you are looking for does not exist or may have been moved.
        </p>

        <Link to="/" className="not-found-button">
          Back to Home
        </Link>
      </section>
    </main>
  );
}

export default NotFound;