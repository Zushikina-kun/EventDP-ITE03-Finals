import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

// Decode JWT payload without a library (just base64 decode the middle part)
function getTokenExpiry(token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null; // convert to ms
  } catch {
    return null;
  }
}

function isTokenValid(token) {
  if (!token) return false;
  const expiry = getTokenExpiry(token);
  if (!expiry) return false;
  return Date.now() < expiry;
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const stored = localStorage.getItem("token");
    // Clear stale/expired token on load
    if (stored && !isTokenValid(stored)) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      return null;
    }
    return stored || null;
  });

  const [username, setUsername] = useState(() =>
    localStorage.getItem("username") || null
  );

  // Auto-logout when token expires while the app is open
  useEffect(() => {
    if (!token) return;
    const expiry = getTokenExpiry(token);
    if (!expiry) return;

    const remaining = expiry - Date.now();
    if (remaining <= 0) {
      logout("expired");
      return;
    }

    const timer = setTimeout(() => logout("expired"), remaining);
    return () => clearTimeout(timer);
  }, [token]); // logout is defined in the same component scope and is stable

  function login(newToken, newUsername) {
    localStorage.setItem("token", newToken);
    localStorage.setItem("username", newUsername);
    setToken(newToken);
    setUsername(newUsername);
  }

  function logout(reason) {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
    // Dispatch event so components can show a toast on session expiry
    if (reason === "expired") {
      window.dispatchEvent(new CustomEvent("session-expired"));
    }
  }

  return (
    <AuthContext.Provider value={{ token, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
