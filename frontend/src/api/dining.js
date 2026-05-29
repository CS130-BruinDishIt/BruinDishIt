const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function parseErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
  } catch {
    // Ignore JSON parse errors.
  }

  return `Request failed (${response.status})`;
}

// Fetch the daily menu for a specific dining hall and date from the database .
export async function fetchDailyMenu(hallSlug, { date, signal } = {}) {
  if (!hallSlug) {
    throw new Error("Hall slug is required.");
  }

  const url = new URL(`/api/dining/menus/${encodeURIComponent(hallSlug)}`, API_BASE_URL);
  if (date) {
    url.searchParams.set("date", date);
  }

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Fetch reviews for a specific menu item from the backend.
// Fetch reviews for a single menu item from the backend.
export async function fetchItemReviews(itemId, { signal } = {}) {
  if (!itemId) {
    throw new Error("Item id is required.");
  }

  const url = new URL(
    `/api/dining/items/${encodeURIComponent(itemId)}/reviews`,
    API_BASE_URL
  );
export async function fetchAllMenuItems(hallSlug, { signal } = {}) {
  if (!hallSlug) {
    throw new Error("Hall slug is required.");
  }

  const url = new URL(`/api/dining/items/${encodeURIComponent(hallSlug)}`, API_BASE_URL);

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Create a new review for a menu item.
export async function createItemReview(itemId, payload, { signal } = {}) {
  if (!itemId) {
    throw new Error("Item id is required.");
  }

  const url = new URL(
    `/api/dining/items/${encodeURIComponent(itemId)}/reviews`,
    API_BASE_URL
  );

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Update an existing review for a menu item.
export async function updateItemReview(itemId, reviewId, payload, { signal } = {}) {
  if (!itemId || !reviewId) {
    throw new Error("Item id and review id are required.");
  }

  const url = new URL(
    `/api/dining/items/${encodeURIComponent(itemId)}/reviews/${encodeURIComponent(reviewId)}`,
    API_BASE_URL
  );

  const response = await fetch(url, {
    method: "PUT",
    signal,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}
