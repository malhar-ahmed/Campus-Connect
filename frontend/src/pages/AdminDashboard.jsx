import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  getAdminDashboard,
  getAdminUsers,
  getAdminItems,
  updateUserStatus,
  updateItemApproval,
} from "../services/adminService";
import "./AdminDashboard.css";

function AdminDashboard() {
  const { user, token, isAuthenticated } = useAuth();

  const [statistics, setStatistics] = useState(null);
  const [users, setUsers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadAdminData = async () => {
    if (!isAuthenticated || !token || user?.role !== "admin") {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const [statsData, usersData, itemsData] = await Promise.all([
        getAdminDashboard(token),
        getAdminUsers(token),
        getAdminItems(token),
      ]);

      setStatistics(statsData.statistics);
      setUsers(usersData.users);
      setItems(itemsData.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!isAuthenticated || !token || user?.role !== "admin") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [statsData, usersData, itemsData] = await Promise.all([
          getAdminDashboard(token),
          getAdminUsers(token),
          getAdminItems(token),
        ]);

        setStatistics(statsData.statistics);
        setUsers(usersData.users);
        setItems(itemsData.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [isAuthenticated, token, user?.role]);

  const handleUserStatus = async (userId, currentStatus) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      await updateUserStatus(userId, !currentStatus, token);

      setSuccessMessage(
        currentStatus
          ? "User blocked successfully."
          : "User unblocked successfully."
      );

      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprovalChange = async (itemId, approvalStatus) => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMessage("");

      await updateItemApproval(itemId, approvalStatus, token);

      setSuccessMessage(`Item ${approvalStatus} successfully.`);

      await loadAdminData();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>Please login first</h1>
          <p>You must login before accessing the admin dashboard.</p>
          <Link to="/login">Go to Login</Link>
        </section>
      </main>
    );
  }

  if (user?.role !== "admin") {
    return (
      <main className="admin-page">
        <section className="admin-empty">
          <h1>Access Denied</h1>
          <p>Only administrators can access this page.</p>
          <Link to="/dashboard">Go to Dashboard</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <section className="admin-header">
        <p className="admin-eyebrow">Admin Control Panel</p>
        <h1>CampusConnect Administration</h1>
        <p>
          Monitor users, item reports, claims, and moderation activity from one
          central dashboard.
        </p>
      </section>

      {loading && <p className="admin-message">Loading admin dashboard...</p>}

      {error && <p className="admin-error">{error}</p>}

      {successMessage && (
        <p className="admin-success">{successMessage}</p>
      )}

      {!loading && !error && statistics && (
        <>
          <section className="admin-stats">
            <div className="admin-stat-card">
              <span>Total Users</span>
              <strong>{statistics.users.total}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Active Users</span>
              <strong>{statistics.users.active}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Blocked Users</span>
              <strong>{statistics.users.blocked}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Total Items</span>
              <strong>{statistics.items.total}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Lost Items</span>
              <strong>{statistics.items.lost}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Found Items</span>
              <strong>{statistics.items.found}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Recovered Items</span>
              <strong>{statistics.items.recovered}</strong>
            </div>

            <div className="admin-stat-card">
              <span>Pending Claims</span>
              <strong>{statistics.claims.pending}</strong>
            </div>
          </section>

          <section className="admin-sections">
            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>User Management</h2>
                  <p>Block or unblock user accounts from the platform.</p>
                </div>
              </div>

              {users.length === 0 ? (
                <p className="admin-muted">No users found.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>User</th>
                        <th>Email</th>
                        <th>Student ID</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((person) => (
                        <tr key={person._id}>
                          <td>
                            <div className="admin-user-main">
                              <strong>{person.name}</strong>
                              <span>{person.faculty || "No faculty"}</span>
                            </div>
                          </td>

                          <td>{person.email}</td>

                          <td>{person.studentId}</td>

                          <td>
                            <span className={`admin-badge ${person.role}`}>
                              {person.role}
                            </span>
                          </td>

                          <td>
                            <span
                              className={
                                person.isActive
                                  ? "admin-badge active"
                                  : "admin-badge blocked"
                              }
                            >
                              {person.isActive ? "Active" : "Blocked"}
                            </span>
                          </td>

                          <td>
                            <div className="admin-actions">
                              {person._id !== user?._id ? (
                                <button
                                  className={
                                    person.isActive
                                      ? "admin-action-button danger"
                                      : "admin-action-button success"
                                  }
                                  disabled={actionLoading}
                                  onClick={() =>
                                    handleUserStatus(
                                      person._id,
                                      person.isActive
                                    )
                                  }
                                >
                                  {person.isActive ? "Block" : "Unblock"}
                                </button>
                              ) : (
                                <span className="admin-muted-small">
                                  Current admin
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-card">
              <div className="admin-card-header">
                <div>
                  <h2>Item Moderation</h2>
                  <p>Review item reports and control their approval status.</p>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="admin-muted">No item reports found.</p>
              ) : (
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Type</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Approval</th>
                        <th>Owner</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((item) => (
                        <tr key={item._id}>
                          <td>
                            <div className="admin-item-main">
                              <strong>{item.title}</strong>
                              <span>{item.location}</span>
                            </div>
                          </td>

                          <td>
                            <span className={`admin-badge ${item.type}`}>
                              {item.type}
                            </span>
                          </td>

                          <td>{item.category}</td>

                          <td>
                            <span className={`admin-badge ${item.status}`}>
                              {item.status}
                            </span>
                          </td>

                          <td>
                            <span
                              className={`admin-badge ${item.approvalStatus}`}
                            >
                              {item.approvalStatus}
                            </span>
                          </td>

                          <td>{item.owner?.name || "Unknown user"}</td>

                          <td>
                            <div className="admin-actions">
                              <button
                                className="admin-action-button success"
                                disabled={
                                  actionLoading ||
                                  item.approvalStatus === "approved"
                                }
                                onClick={() =>
                                  handleApprovalChange(item._id, "approved")
                                }
                              >
                                Approve
                              </button>

                              <button
                                className="admin-action-button danger"
                                disabled={
                                  actionLoading ||
                                  item.approvalStatus === "rejected"
                                }
                                onClick={() =>
                                  handleApprovalChange(item._id, "rejected")
                                }
                              >
                                Reject
                              </button>

                              <Link
                                to={`/items/${item._id}`}
                                className="admin-action-button"
                              >
                                View
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

export default AdminDashboard;