import API_BASE_URL from "./api";

export const getAdminDashboard = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load admin dashboard");
  }

  return data;
};

export const getAdminUsers = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load users");
  }

  return data;
};

export const getAdminItems = async (token) => {
  const response = await fetch(`${API_BASE_URL}/admin/items`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load items");
  }

  return data;
};

export const updateUserStatus = async (userId, isActive, token) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/users/${userId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update user status");
  }

  return data;
};

export const updateItemApproval = async (
  itemId,
  approvalStatus,
  token
) => {
  const response = await fetch(
    `${API_BASE_URL}/admin/items/${itemId}/approval`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ approvalStatus }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update item approval");
  }

  return data;
};