import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useTheme } from "../context/useTheme";
import lightLogo from "../assets/campusconnect-logo.png";
import darkLogo from "../assets/campusconnect-logo-dark.png";
import "./Navbar.css";

function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();

  const currentLogo = isDarkMode ? darkLogo : lightLogo;

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <img
          src={currentLogo}
          alt="CampusConnect Logo"
          className="navbar-logo-img"
        />

        <div className="brand-text">
          <h2>
            <span className="brand-campus">Campus</span>
            <span className="brand-connect">Connect</span>
          </h2>

          <p>Smart Lost & Found Platform</p>
        </div>
      </Link>

      <nav className="navbar-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/items">Items</NavLink>

        {isAuthenticated && (
          <>
            <NavLink to="/report-item">Report Item</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
          </>
        )}

        {isAuthenticated && user?.role === "admin" && (
          <NavLink to="/admin">Admin</NavLink>
        )}
      </nav>

      <div className="navbar-actions">
        <button
          type="button"
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={
            isDarkMode ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          <span className="theme-toggle-icon">
            {isDarkMode ? "☀️" : "🌙"}
          </span>

          <span className="theme-toggle-text">
            {isDarkMode ? "Light" : "Dark"}
          </span>
        </button>

        {isAuthenticated ? (
          <>
            <span className="navbar-user">Hi, {user?.name}</span>

            <button
              type="button"
              className="logout-button"
              onClick={logout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="login-link">
              Login
            </Link>

            <Link to="/register" className="register-button">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;