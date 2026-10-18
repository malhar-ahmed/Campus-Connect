import { Link } from "react-router-dom";
import "./Auth.css";

function ForgotPassword() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Account Recovery</p>
          <h1>Password Recovery</h1>
          <p>
            Password recovery is currently unavailable. Please contact a campus
            administrator for help accessing your account.
          </p>
        </div>
        <p className="auth-footer-text">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;
