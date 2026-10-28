import API_BASE_URL from "./api";

export const getItems = async (filters = {}) => {
  const queryParams = new URLSearchParams();

  if (filters.type) queryParams.append("type", filters.type);
  if (filters.category) queryParams.append("category", filters.category);
  if (filters.location) queryParams.append("location", filters.location);
  if (filters.search) queryParams.append("search", filters.search);

  const queryString = queryParams.toString();

  const url = queryString
    ? `${API_BASE_URL}/items?${queryString}`
    : `${API_BASE_URL}/items`;

  const response = await fetch(url);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load items");
  }

  return data;
};

export const createItem = async (itemData, token) => {
  const formData = new FormData();

  formData.append("title", itemData.title);
  formData.append("description", itemData.description);
  formData.append("type", itemData.type);
  formData.append("category", itemData.category);
  formData.append("location", itemData.location);
  formData.append("incidentDate", itemData.incidentDate);

  if (itemData.image) {
    formData.append("image", itemData.image);
  }

  const response = await fetch(`${API_BASE_URL}/items`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create item");
  }

  return data;
};
export const getItemById = async (itemId) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load item details");
  }

  return data;
};

export const getItemMatches = async (itemId) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}/matches`);

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load item matches");
  }

  return data;
};


export const getMyItems = async (token) => {
  const response = await fetch(
    `${API_BASE_URL}/items/mine`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load reports");
  }

  return data;
};


export const updateItem = async (itemId, updates, token) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update item");
  }

  return data;
};

export const deleteItem = async (itemId, token) => {
  const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete item");
  }

  return data;
};

