const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

async function parseErrorMessage(response) {
  try {
    const payload = await response.json();
    if (payload && typeof payload.message === "string") {
      return payload.message;
    }
    if (payload && typeof payload.error === "string") {
      return payload.error;
    }
  } catch {
    // Ignore JSON parse errors.
  }

  return `Request failed (${response.status})`;
}

// Sending username and password to backend to create new user account
export async function signupUser({ username, password }) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: "POST",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

// Sending usr and pswd to backend to verify and log in user, return user data if success
export async function loginUser({ username, password }) {
    const response = await fetch(`$(API_BASE_URL)/api/auth/login`, {
        method: "POST",
        headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
    });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}