import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
} from "../services/claimService";
import Toast from "../components/Toast";
import "./Dashboard.css";

function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();

  const [myClaims, setMyClaims] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [toast, setToast] = useState({
    message: "",
    type: "info",
  });

  const loadDashboardData = async () => {
    if (!isAuthenticated || !token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [myClaimsData, receivedClaimsData] = await Promise.all([
        getMyClaims(token),
        getReceivedClaims(token),
      ]);

      setMyClaims(myClaimsData.claims);
      setReceivedClaims(receivedClaimsData.claims);
    } catch (err) {
      setError(err.message);
      setToast({
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [myClaimsData, receivedClaimsData] = await Promise.all([
          getMyClaims(token),
          getReceivedClaims(token),
        ]);

        setMyClaims(myClaimsData.claims);
        setReceivedClaims(receivedClaimsData.claims);
      } catch (err) {
        setError(err.message);
        setToast({
          message: err.message,
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (!toast.message) return;

    const timer = setTimeout(() => {
      setToast({
        message: "",
        type: "info",
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast.message]);

  const handleReviewClaim = async (claimId, status) => {
    const confirmMessage =
      status === "approved"
        ? "Are you sure you want to approve this claim?"
        : "Are you sure you want to reject this claim?";

    const confirmed = window.confirm(confirmMessage);

    if (!confirmed) return;

    const reviewMessage =
      status === "approved"
        ? "The proof details match the item. Claim approved."
        : "The proof details were not sufficient. Claim rejected.";

    try {
      setReviewLoading(true);
      setError("");
      setSuccessMessage("");

      await reviewClaim(
        claimId,
        {
          status,
          reviewMessage,
        },
        token
      );

      setSuccessMessage(`Claim ${status} successfully`);

      setToast({
        message: `Claim ${status} successfully`,
        type: "success",
      });

      await loadDashboardData();
    } catch (err) {
      setError(err.message);

      setToast({
        message: err.message,
        type: "error",
      });
    } finally {
      setReviewLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="dashboard-page">
        <section className="dashboard-empty">
          <h1>Please login first</h1>
          <p>You need to login before accessing your dashboard.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-page">
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: "", type: "info" })}
      />

      <section className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">User Dashboard</p>
          <h1>Welcome, {user?.name}</h1>
          <p>
            Manage your lost and found activity, check claims, and create new
            reports.
          </p>
        </div>

        <Link to="/report-item" className="dashboard-main-action">
          Report New Item
        </Link>
      </section>

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span>My Claims</span>
          <strong>{myClaims.length}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Received Claims</span>
          <strong>{receivedClaims.length}</strong>
        </div>

        <div className="dashboard-stat-card">
          <span>Account Role</span>
          <strong>{user?.role}</strong>
        </div>
      </section>

      <section className="dashboard-actions-grid">
        <Link to="/items" className="dashboard-action-card">
          <h3>Browse Items</h3>
          <p>Search lost and found reports from the campus community.</p>
        </Link>

        <Link to="/report-item" className="dashboard-action-card">
          <h3>Report Item</h3>
          <p>Create a new lost or found item report.</p>
        </Link>

        {user?.role === "admin" && (
          <Link to="/admin" className="dashboard-action-card">
            <h3>Admin Panel</h3>
            <p>Manage users, item approvals, and dashboard statistics.</p>
          </Link>
        )}
      </section>

      {loading && <p className="dashboard-message">Loading dashboard...</p>}

      {error && <p className="dashboard-error">{error}</p>}

      {successMessage && (
        <p className="dashboard-success">{successMessage}</p>
      )}

      {!loading && !error && (
        <section className="dashboard-lists">
          <div className="dashboard-list-card">
            <h2>My Submitted Claims</h2>

            {myClaims.length === 0 ? (
              <p className="dashboard-muted">
                You have not submitted claims yet.
              </p>
            ) : (
              <div className="claim-list">
                {myClaims.map((claim) => (
                  <article className="claim-card" key={claim._id}>
                    <div>
                      <h3>{claim.item?.title}</h3>
                      <p>{claim.message}</p>

                      {claim.reviewMessage && (
                        <p className="claim-message">
                          Review: {claim.reviewMessage}
                        </p>
                      )}
                    </div>

                    <span className={`claim-status ${claim.status}`}>
                      {claim.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-list-card">
            <h2>Claims Received</h2>

            {receivedClaims.length === 0 ? (
              <p className="dashboard-muted">
                No one has claimed your item reports yet.
              </p>
            ) : (
              <div className="claim-list">
                {receivedClaims.map((claim) => (
                  <article className="claim-card" key={claim._id}>
                    <div>
                      <h3>{claim.item?.title}</h3>

                      <p>
                        Claimed by {claim.claimant?.name} —{" "}
                        {claim.proofDetails}
                      </p>

                      {claim.message && (
                        <p className="claim-message">
                          Message: {claim.message}
                        </p>
                      )}

                      {claim.reviewMessage && (
                        <p className="claim-message">
                          Review: {claim.reviewMessage}
                        </p>
                      )}

                      {claim.status === "pending" && (
                        <div className="claim-actions">
                          <button
                            className="approve-claim-button"
                            disabled={reviewLoading}
                            onClick={() =>
                              handleReviewClaim(claim._id, "approved")
                            }
                          >
                            Approve
                          </button>

                          <button
                            className="reject-claim-button"
                            disabled={reviewLoading}
                            onClick={() =>
                              handleReviewClaim(claim._id, "rejected")
                            }
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>

                    <span className={`claim-status ${claim.status}`}>
                      {claim.status}
                    </span>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}

export default Dashboard;