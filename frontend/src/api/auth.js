const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export function getAuthUser() {
  const savedUser = localStorage.getItem("user");
  return savedUser ? JSON.parse(savedUser) : null;
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function authJsonHeaders(options = {}) {
  const token = getAuthToken();


  const headers = {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Only add JSON Content-Type if it wasn't already manually provided
  if (options.body && !(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

export function isTokenExpired(token) {
  if (!token) return true;
  try {
    // JWT format: Header.Payload.Signature
    const payloadBase64 = token.split(".")[1];
    const payloadJson = atob(payloadBase64); // Decodes base64 string
    const { exp } = JSON.parse(payloadJson);

    // exp is in seconds; Date.now() is in milliseconds
    return Date.now() >= exp * 1000;
  } catch {
    return true; // Invalid token
  }
}

export async function authFetch(url, options = {}) {
  const token = getAuthToken();

  // Check token before making the request
  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new CustomEvent("session-expired"));
    throw new Error("Session expired. Please sign in again.");
  }
  const response = await fetch(url, {
    ...options,
    headers: authJsonHeaders(options),
  });

  // Catch server-side as a fallback
  if (response.status === 401) {
    const hadToken = !!getAuthToken();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Only redirect if we had a token and we aren't already on the /signin page
    if (hadToken && window.location.pathname !== "/signin") {
      window.location.href = "/signin";
      throw new Error("Session expired. Please sign in again.");
    }
  }

  return response;
}

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
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
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


export async function updatePW({ currentPassword, newPassword }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/changePW`, {
    method: "PATCH",
    headers: authJsonHeaders(),
    body: JSON.stringify({
      currentPassword,
      newPassword
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function getUserProfileAndReviews(userId) {
  // Pass the userId dynamically into the URL endpoint
  const response = await fetch(`${API_BASE_URL}/api/auth/user/${userId}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function editProfilePic(profileImageURL) {
  const response = await fetch(`${API_BASE_URL}/api/auth/editProfilePic`, {
    method: "PATCH",
    headers: authJsonHeaders(), // Attaches your authentication token and Content-Type headers
    body: JSON.stringify({
      profileImageURL
    }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  return response.json();
}

export async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file); // "image" matches upload.single("image") on the backend

  const url = new URL(`/api/auth/uploadImage`, API_BASE_URL);

  const response = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) throw new Error("Image upload failed.");

  const data = await response.json();
  return data.url;
}

export function saveAuthSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

//sign out by clearing local storage
export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}