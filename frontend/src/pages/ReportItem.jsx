import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createItem } from "../services/itemService";
import { useAuth } from "../context/useAuth";
import CustomSelect from "../components/CustomSelect";
import "./ReportItem.css";

const typeOptions = [
  { value: "lost", label: "Lost Item" },
  { value: "found", label: "Found Item" },
];

const categoryOptions = [
  { value: "Electronics", label: "Electronics" },
  { value: "Documents", label: "Documents" },
  { value: "Bags", label: "Bags" },
  { value: "Clothing", label: "Clothing" },
  { value: "Keys", label: "Keys" },
  { value: "Books", label: "Books" },
  { value: "Accessories", label: "Accessories" },
  { value: "Other", label: "Other" },
];

function ReportItem() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    category: "",
    location: "",
    incidentDate: "",
    image: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB");
      return;
    }

    setError("");

    setFormData((previousData) => ({
      ...previousData,
      image: file,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (formData.description.trim().length < 10) {
      setError("Description must contain at least 10 characters");
      return;
    }

    if (!isAuthenticated || !token) {
      setError("Please login before reporting an item");
      return;
    }

    if (!formData.type || !formData.category) {
      setError("Please select report type and category");
      return;
    }

    try {
      setLoading(true);

      await createItem(formData, token);

      navigate("/items");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <main className="report-page">
        <section className="report-login-card">
          <p className="report-eyebrow">Authentication Required</p>
          <h1>Please login first</h1>
          <p>You need to login before creating a lost or found item report.</p>

          <Link to="/login" className="report-login-button">
            Go to Login
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="report-page">
      <section className="report-layout">
        <div className="report-card">
          <div className="report-header">
            <p className="report-eyebrow">Create Item Report</p>
            <h1>Report a Lost or Found Item</h1>
            <p>
              Add clear details so CampusConnect can help users search, claim,
              and match items accurately.
            </p>
          </div>

          {error && <div className="report-error">{error}</div>}

          <form className="report-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Item Title</label>
              <input
                type="text"
                name="title"
                placeholder="Example: Black Casio Calculator"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <CustomSelect
                label="Report Type"
                name="type"
                value={formData.type}
                placeholder="Select report type"
                options={typeOptions}
                onChange={handleChange}
              />

              <CustomSelect
                label="Category"
                name="category"
                value={formData.category}
                placeholder="Select category"
                options={categoryOptions}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Example: Main Library"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Lost / Found Date</label>
                <input
                  type="date"
                  name="incidentDate"
                  value={formData.incidentDate}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Item Photo Optional</label>
              <input
                type="file"
                name="image"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                onChange={handleImageChange}
              />
            </div>

            <div className="form-group">
              <label>Description</label>

              <textarea
                name="description"
                placeholder="Describe the item clearly. Include color, brand, marks, location details, or any useful information."
                value={formData.description}
                onChange={handleChange}
                rows="5"
                minLength={10}
                maxLength={1000}
                required
              ></textarea>
              <small>
                Description must contain 10–1000 characters.
              </small>

            </div>

            <button className="report-button" type="submit" disabled={loading}>
              {loading ? "Submitting report..." : "Submit Report"}
            </button>
          </form>
        </div>

        <aside className="report-preview-card">
          <p className="preview-label">Live Report Preview</p>

          <div className="preview-item-card">
            {formData.image && (
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Item preview"
                className="preview-image"
              />
            )}
            <div className="preview-top">
              <span className={`preview-type ${formData.type || "default"}`}>
                {formData.type || "type"}
              </span>

              <span className="preview-status">open</span>
            </div>

            <h2>{formData.title || "Item title will appear here"}</h2>

            <p>
              {formData.description ||
                "Your item description will appear here as you type."}
            </p>

            <div className="preview-meta">
              <span>{formData.category || "Category"}</span>
              <span>{formData.location || "Location"}</span>
              <span>{formData.incidentDate || "Date"}</span>
            </div>
          </div>

          <div className="report-tips">
            <h3>Tips for better matching</h3>

            <ul>
              <li>Use a clear item title.</li>
              <li>Add the exact campus location.</li>
              <li>Mention brand, color, marks, or contents.</li>
              <li>Select the correct category and report type.</li>
            </ul>
          </div>

          <div className="matching-note">
            <span>Smart Matching</span>
            <p>
              Category, location, keywords, and date are used to suggest
              possible matches.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default ReportItem;