import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getMyClaims,
  getReceivedClaims,
  reviewClaim,
} from "../services/claimService";
import Toast from "../components/Toast";
import {
  getMyItems,
  deleteItem,
  updateItem,
} from "../services/itemService";
import "./Dashboard.css";

function Dashboard() {
  const { user, token, isAuthenticated } = useAuth();

  const [myClaims, setMyClaims] = useState([]);
  const [myItems, setMyItems] = useState([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [reportsError, setReportsError] = useState("");
  const [deletingItemId, setDeletingItemId] = useState(null);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteError, setDeleteError] = useState("");
  const [receivedClaims, setReceivedClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editForm, setEditForm] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");

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
    if (!isAuthenticated || !token) return;

    let active = true;

    getMyItems(token)
      .then((data) => {
        if (active) {
          setMyItems(data.items || []);
          setReportsError("");
        }
      })
      .catch((err) => {
        if (active) {
          setReportsError(err.message);
        }
      })
      .finally(() => {
        if (active) {
          setReportsLoading(false);
        }
      });

    return () => {
      active = false;
    };
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

  const handleDeleteReport = async (item) => {
    try {
      setDeletingItemId(item._id);
      setDeleteError("");

      await deleteItem(item._id, token);

      setMyItems((previousItems) =>
        previousItems.filter(
          (report) => report._id !== item._id
        )
      );

      setItemToDelete(null);

      setToast({
        message: "Report deleted successfully",
        type: "success",
      });
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingItemId(null);
    }
  };


  const openEditReport = (item) => {
    setEditError("");

    setEditForm({
      _id: item._id,
      title: item.title || "",
      description: item.description || "",
      type: item.type || "lost",
      category: item.category || "Other",
      location: item.location || "",
      incidentDate: item.incidentDate
        ? item.incidentDate.slice(0, 10)
        : "",
    });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editForm || editSaving) return;

    try {
      setEditSaving(true);
      setEditError("");

      const { _id, ...updates } = editForm;

      const result = await updateItem(
        _id,
        updates,
        token
      );

      setMyItems((previousItems) =>
        previousItems.map((item) =>
          item._id === _id
            ? { ...item, ...result.item }
            : item
        )
      );

      setEditForm(null);

      setToast({
        message: "Report updated successfully",
        type: "success",
      });
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditSaving(false);
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


      <section
        className="dashboard-list-card"
        style={{ marginBottom: "24px" }}
      >
        <h2>My Reports</h2>

        {reportsLoading ? (
          <p className="dashboard-muted">Loading your reports...</p>
        ) : reportsError ? (
          <p className="dashboard-error">{reportsError}</p>
        ) : myItems.length === 0 ? (
          <p className="dashboard-muted">
            You have not reported any items yet.
          </p>
        ) : (
          <div className="claim-list">
            {myItems.map((item) => (
              <article className="claim-card" key={item._id}>
                <div>
                  <h3>{item.title}</h3>
                  <p>
                    {item.type} · {item.category} · {item.location}
                  </p>
                  <p>Approval: {item.approvalStatus}</p>

                  {item.approvalStatus === "approved" && (
                    <Link to={`/items/${item._id}`}>
                      View Report
                    </Link>
                  )}

                  <div className="claim-actions">
                    <button
                      type="button"
                      className="crud-edit-trigger"
                      onClick={() => openEditReport(item)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="reject-claim-button"
                      onClick={() => {
                        setDeleteError("");
                        setItemToDelete(item);
                      }}
                      disabled={deletingItemId === item._id}
                    >
                      {deletingItemId === item._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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


      {itemToDelete && (
        <div className="crud-modal-overlay">
          <div
            className="crud-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-report-title"
          >
            <div className="crud-modal-icon">🗑️</div>

            <h2 id="delete-report-title">
              Delete Report?
            </h2>

            <p>
              Are you sure you want to permanently delete
              <strong> "{itemToDelete.title}"</strong>?
            </p>

            <p>This action cannot be undone.</p>

            {deleteError && (
              <p className="crud-modal-error" role="alert">
                {deleteError}
              </p>
            )}

            <div className="crud-modal-actions">
              <button
                type="button"
                className="crud-cancel-button"
                disabled={deletingItemId !== null}
                onClick={() => setItemToDelete(null)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="crud-delete-button"
                disabled={deletingItemId !== null}
                onClick={() => handleDeleteReport(itemToDelete)}
              >
                {deletingItemId !== null
                  ? "Deleting..."
                  : "Delete Report"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editForm && (
        <div className="crud-modal-overlay">
          <div
            className="crud-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-report-title"
          >
            <h2 id="edit-report-title">Edit Item Report</h2>
            <p>Update your report details below.</p>

            {editError && (
              <p className="crud-modal-error" role="alert">
                {editError}
              </p>
            )}

            <form className="crud-edit-form" onSubmit={handleSaveEdit}>
              <label>
                Item Title
                <input
                  name="title"
                  value={editForm.title}
                  onChange={handleEditChange}
                  minLength={2}
                  maxLength={100}
                  required
                />
              </label>

              <label>
                Report Type
                <select
                  name="type"
                  value={editForm.type}
                  onChange={handleEditChange}
                  required
                >
                  <option value="lost">Lost Item</option>
                  <option value="found">Found Item</option>
                </select>
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={editForm.category}
                  onChange={handleEditChange}
                  required
                >
                  {[
                    "Electronics",
                    "Documents",
                    "Bags",
                    "Clothing",
                    "Keys",
                    "Books",
                    "Accessories",
                    "Other",
                  ].map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Location
                <input
                  name="location"
                  value={editForm.location}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Lost / Found Date
                <input
                  type="date"
                  name="incidentDate"
                  value={editForm.incidentDate}
                  onChange={handleEditChange}
                  required
                />
              </label>

              <label>
                Description
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleEditChange}
                  minLength={10}
                  maxLength={1000}
                  rows={4}
                  required
                />
              </label>

              <div className="crud-modal-actions">
                <button
                  type="button"
                  className="crud-cancel-button"
                  disabled={editSaving}
                  onClick={() => setEditForm(null)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="crud-save-button"
                  disabled={editSaving}
                >
                  {editSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Dashboard;