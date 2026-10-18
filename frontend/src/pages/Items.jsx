import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getItems } from "../services/itemService";
import CustomSelect from "../components/CustomSelect";
import "./Items.css";

const typeOptions = [
  { value: "", label: "All Types" },
  { value: "lost", label: "Lost Items" },
  { value: "found", label: "Found Items" },
];

const categoryOptions = [
  { value: "", label: "All Categories" },
  { value: "Electronics", label: "Electronics" },
  { value: "Documents", label: "Documents" },
  { value: "Bags", label: "Bags" },
  { value: "Clothing", label: "Clothing" },
  { value: "Keys", label: "Keys" },
  { value: "Books", label: "Books" },
  { value: "Accessories", label: "Accessories" },
  { value: "Other", label: "Other" },
];

function Items() {
  const [items, setItems] = useState([]);

  const [filters, setFilters] = useState({
    type: "",
    category: "",
    search: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadItems = async (currentFilters = filters) => {
    try {
      setLoading(true);
      setError("");

      const data = await getItems(currentFilters);
      setItems(data.items);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialItems = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getItems();
        setItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialItems();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFilters((previousFilters) => ({
      ...previousFilters,
      [name]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();
    loadItems();
  };

  const clearFilters = async () => {
    const emptyFilters = {
      type: "",
      category: "",
      search: "",
      location: "",
    };

    setFilters(emptyFilters);
    await loadItems(emptyFilters);
  };

  return (
    <main className="items-page">
      <section className="items-header">
        <p className="items-eyebrow">Campus Lost & Found</p>
        <h1>Browse Lost and Found Items</h1>
        <p>
          Search reports submitted by students and staff. Use filters to find
          matching items faster.
        </p>
      </section>

      <form className="filters-card" onSubmit={handleSearch}>
        <div className="filter-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            placeholder="Calculator, laptop, bag..."
            value={filters.search}
            onChange={handleChange}
          />
        </div>

        <CustomSelect
          label="Type"
          name="type"
          value={filters.type}
          placeholder="All Types"
          options={typeOptions}
          onChange={handleChange}
        />

        <CustomSelect
          label="Category"
          name="category"
          value={filters.category}
          placeholder="All Categories"
          options={categoryOptions}
          onChange={handleChange}
        />

        <div className="filter-group">
          <label>Location</label>
          <input
            type="text"
            name="location"
            placeholder="Library, lab, cafeteria..."
            value={filters.location}
            onChange={handleChange}
          />
        </div>

        <div className="filter-actions">
          <button type="submit">Search</button>

          <button type="button" className="clear-button" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </form>

      {loading && <p className="items-message">Loading items...</p>}

      {error && <p className="items-error">{error}</p>}

      {!loading && !error && items.length === 0 && (
        <p className="items-message">No item reports found.</p>
      )}

      {!loading && !error && items.length > 0 && (
        <section className="items-grid">
          {items.map((item) => (
            <article className="item-card" key={item._id}>
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="item-card-image"
                />
              )}
              <div className="item-card-top">
                <span className={`item-type ${item.type}`}>
                  {item.type}
                </span>

                <span className="item-status">{item.status}</span>
              </div>

              <h2>{item.title}</h2>

              <p className="item-description">{item.description}</p>

              <div className="item-meta">
                <span>{item.category}</span>
                <span>{item.location}</span>
              </div>

              <div className="item-footer">
                <small>
                  Posted by {item.owner?.name || "Unknown user"}
                </small>

                <small>
                  {new Date(item.incidentDate).toLocaleDateString()}
                </small>
              </div>

              <Link to={`/items/${item._id}`} className="view-details-link">
                View Details
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default Items;