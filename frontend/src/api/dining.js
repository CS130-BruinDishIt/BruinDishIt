import { authJsonHeaders } from "./auth";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function parseErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
    if (payload && typeof payload.error === "string") { // backend errors too
      return payload.error;
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

// Fetch reviews for a menu item or dining hall from the backend.
export async function fetchReviews(id, type, { signal } = {}) {
  if (!id) {
    throw new Error("Item or hall id is required.");
  }
  if (type !== "items" && type !== "halls") throw new Error("Invalid review type.");

  const url = new URL(
    `/api/dining/${type}/${encodeURIComponent(id)}/reviews`,
    API_BASE_URL
  );

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

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

// Create a new review for a menu item or dining hall.
export async function createReview(id, type, payload, { signal } = {}) {
  if (!id) throw new Error('Item or hall id is required.');
  if (type !== "items" && type !== "halls") throw new Error("Invalid review type.");

  const url = new URL(`/api/dining/${type}/${encodeURIComponent(id)}/reviews`, API_BASE_URL);

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Update an existing review for a menu item or dining hall.
export async function updateReview(id, type, reviewId, payload, { signal } = {}) {
  // 1. Validation guards
  if (!id || !reviewId) {
    throw new Error("Both the parent ID and review ID are required.");
  }
  if (type !== "items" && type !== "halls") throw new Error("Invalid review type.");

  const url = new URL(
    `/api/dining/${type}/${encodeURIComponent(id)}/reviews/${encodeURIComponent(reviewId)}`,
    API_BASE_URL
  );

  const response = await fetch(url, {
    method: "PUT",
    signal,
    headers: authJsonHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Like/dislike reaction to an existing review.
export async function reactToReview(id, type, reviewId, reaction, { signal } = {}) {
  if (!id || !reviewId) {
    throw new Error("Both the parent ID and review ID are required.");
  }
  if (type !== "items" && type !== "halls") throw new Error("Invalid review type.");
  if (reaction !== "like" && reaction !== "dislike") {
    throw new Error("Reaction must be 'like' or 'dislike'.");
  }

  const url = new URL(
    `/api/dining/${type}/${encodeURIComponent(id)}/reviews/${encodeURIComponent(reviewId)}/reactions`,
    API_BASE_URL
  );

  const response = await fetch(url, {
    method: "POST",
    signal,
    headers: authJsonHeaders(),
    body: JSON.stringify({ reaction }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Fetch all dining halls
export async function fetchDiningHalls({ signal } = {}) {
  const url = new URL(`/api/dining/halls`, API_BASE_URL);

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Fetch a specific dining hall
export async function fetchDiningHall(slug, { signal } = {}) {
  if (!slug) {
    throw new Error("Hall slug is required.");
  }

  const url = new URL(`/api/dining/halls/${encodeURIComponent(slug)}`, API_BASE_URL);

  const response = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}