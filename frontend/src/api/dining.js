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
