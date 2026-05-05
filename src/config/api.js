// API base URLs — set in .env (VITE_ prefix required for Vite to expose them)
export const EXPRESS_API = import.meta.env.VITE_EXPRESS_API || "http://localhost:5000";
export const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || "http://127.0.0.1:8000";

export const COURSES = [
  "BSIT",
  "BSCS",
  "BSIS",
  "BSCE",
  "BSEE",
  "BSME",
  "BSN",
  "BSBA",
  "BSED",
  "Other",
];
