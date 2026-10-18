import API_BASE_URL from "./api";

export const getMyClaims = async (token) => {
  const response = await fetch(`${API_BASE_URL}/claims/mine`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load your claims");
  }

  return data;
};

export const getReceivedClaims = async (token) => {
  const response = await fetch(`${API_BASE_URL}/claims/received`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to load received claims");
  }

  return data;
};

export const createClaim = async (claimData, token) => {
  const response = await fetch(`${API_BASE_URL}/claims`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(claimData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit claim");
  }

  return data;
};

export const reviewClaim = async (claimId, reviewData, token) => {
  const response = await fetch(
    `${API_BASE_URL}/claims/${claimId}/review`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(reviewData),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to review claim");
  }

  return data;
};