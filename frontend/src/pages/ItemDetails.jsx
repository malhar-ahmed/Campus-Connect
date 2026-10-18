import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { getItemById, getItemMatches } from "../services/itemService";
import { createClaim } from "../services/claimService";
import "./ItemDetails.css";

function ItemDetails() {
  const { id } = useParams();
  const { user, token, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [matches, setMatches] = useState([]);
  const [claimData, setClaimData] = useState({
    message: "",
    proofDetails: "",
  });

  const [loading, setLoading] = useState(true);
  const [claimLoading, setClaimLoading] = useState(false);
  const [error, setError] = useState("");
  const [claimError, setClaimError] = useState("");
  const [claimSuccess, setClaimSuccess] = useState("");

  useEffect(() => {
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const itemData = await getItemById(id);
        const matchData = await getItemMatches(id);

        setItem(itemData.item);
        setMatches(matchData.matches || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleClaimChange = (e) => {
    setClaimData({
      ...claimData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();

    try {
      setClaimLoading(true);
      setClaimError("");
      setClaimSuccess("");

      await createClaim(
        {
          itemId: item._id,
          message: claimData.message,
          proofDetails: claimData.proofDetails,
        },
        token
      );

      setClaimSuccess("Claim submitted successfully. Wait for the owner to review it.");
      setClaimData({
        message: "",
        proofDetails: "",
      });
    } catch (err) {
      setClaimError(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="item-details-page">
        <p className="details-message">Loading item details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="item-details-page">
        <p className="details-error">{error}</p>
      </main>
    );
  }

  if (!item) {
    return (
      <main className="item-details-page">
        <p className="details-error">Item not found.</p>
      </main>
    );
  }

  const isOwner = Boolean(user?.id && item.owner?._id && user.id === item.owner._id);
  const isClosed = item.status === "recovered" || item.status === "closed";

  return (
    <main className="item-details-page">
      <Link to="/items" className="details-back-link">
        ← Back to Items
      </Link>

      <section className="details-layout">
        <div className="details-main-card">
          {item.imageUrl && (
            <img
              src={item.imageUrl}
              alt={item.title}
              className="details-image"
            />
          )}
          <div className="details-header">
            <div className="details-title">
              <div className="details-badges">
                <span className={`details-badge ${item.type}`}>
                  {item.type}
                </span>

                <span className="details-badge status">
                  {item.status}
                </span>
              </div>

              <h1>{item.title}</h1>
              <p>
                Reported on{" "}
                {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <p className="details-description">{item.description}</p>

          <div className="details-info-grid">
            <div className="info-box">
              <span>Category</span>
              <strong>{item.category}</strong>
            </div>

            <div className="info-box">
              <span>Location</span>
              <strong>{item.location}</strong>
            </div>

            <div className="info-box">
              <span>Incident Date</span>
              <strong>
                {new Date(item.incidentDate).toLocaleDateString()}
              </strong>
            </div>

            <div className="info-box">
              <span>Report Type</span>
              <strong>{item.type}</strong>
            </div>
          </div>

          <div className="owner-box">
            <span>Posted By</span>
            <p>
              <strong>{item.owner?.name}</strong>
              <br />
              {item.owner?.faculty}
            </p>
          </div>
        </div>

        <div className="details-side">
          <section className="claim-card-section">
            <h2>Claim This Item</h2>

            {!isAuthenticated && (
              <>
                <p>
                  Please login to submit a verified claim for this item.
                </p>
                <Link to="/login" className="claim-login-link">
                  Login to Claim
                </Link>
              </>
            )}

            {isAuthenticated && isOwner && (
              <p className="claim-warning">
                You cannot claim your own item report.
              </p>
            )}

            {isAuthenticated && !isOwner && isClosed && (
              <p className="claim-warning">
                This item is already {item.status}. New claims are not allowed.
              </p>
            )}

            {isAuthenticated && !isOwner && !isClosed && (
              <form className="claim-form" onSubmit={handleClaimSubmit}>
                <label>
                  Message to Owner
                  <textarea
                    name="message"
                    value={claimData.message}
                    onChange={handleClaimChange}
                    placeholder="Explain why you think this item belongs to you..."
                    required
                  ></textarea>
                </label>

                <label>
                  Proof Details
                  <textarea
                    name="proofDetails"
                    value={claimData.proofDetails}
                    onChange={handleClaimChange}
                    placeholder="Example: color, marks, contents, serial number, special details..."
                    required
                  ></textarea>
                </label>

                {claimError && (
                  <p className="claim-error">{claimError}</p>
                )}

                {claimSuccess && (
                  <p className="claim-success">{claimSuccess}</p>
                )}

                <button
                  type="submit"
                  className="claim-submit-button"
                  disabled={claimLoading}
                >
                  {claimLoading ? "Submitting..." : "Submit Claim"}
                </button>
              </form>
            )}
          </section>

          <section className="smart-match-section">
            <p className="smart-label">Smart Matching</p>
            <h2>Possible Matches</h2>
            <p>
              These matches are calculated using category, location,
              keywords, and date closeness.
            </p>

            {matches.length === 0 ? (
              <p className="details-message">
                No smart matches found for this item.
              </p>
            ) : (
              <div className="match-list">
                {matches.map((match) => {
                  const matchedItem = match.item || match;

                  return (
                    <Link
                      to={`/items/${matchedItem._id}`}
                      className="match-card"
                      key={matchedItem._id}
                    >
                      <div className="match-card-top">
                        <span className={`details-badge ${matchedItem.type}`}>
                          {matchedItem.type}
                        </span>

                        <span className="match-score-badge">
                          {match.matchScore || match.score}% Match
                        </span>
                      </div>

                      <h3>{matchedItem.title}</h3>

                      <p>{matchedItem.description}</p>

                      <div className="match-meta">
                        <span>{matchedItem.category}</span>
                        <span>{matchedItem.location}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

export default ItemDetails;
