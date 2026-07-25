// frontend-admin/src/services/authService.js

import { API_BASE } from "./config";

/* =========================
   LOGIN (AUTH ONLY — NO ROLE CHECK)
========================= */
export async function login(loginInput, password) {
  const body = loginInput.includes("@")
    ? { email: loginInput, password }
    : { username: loginInput, password };

  const response = await fetch(`${API_BASE}/en/api/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.detail || "Login failed");
  }

  // store token ONLY if exists
  if (data.key) {
    localStorage.setItem("token", data.key);
  } else if (data.token) {
    localStorage.setItem("token", data.token);
  }

  // DO NOT assume user exists here always
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
  }

  return data;
}

/* =========================
   LOGOUT
========================= */
export async function logout() {
  const token = localStorage.getItem("token");

  try {
    await fetch(`${API_BASE}/en/api/auth/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token}`,
      },
    });
  } catch {
    console.warn("Server logout failed, continuing local logout");
  }

  localStorage.removeItem("token");
  localStorage.removeItem("user");

  window.location.href = "/login";
}

/* =========================
   CURRENT USER (TRUTH SOURCE)
========================= */
export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE}/en/api/auth/user/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (response.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return await response.json();
}

/* =========================
   DELETE ACCOUNT
========================= */
export async function deleteAccount(token) {
  const response = await fetch(`${API_BASE}/en/api/auth/delete-account/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete account");
  }

  return await response.json();
}
