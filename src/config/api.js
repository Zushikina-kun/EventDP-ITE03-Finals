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

export const STUDENT_STATUSES = [
  { value: "active", label: "Active", color: "emerald" },
  { value: "inactive", label: "Inactive", color: "slate" },
  { value: "graduated", label: "Graduated", color: "blue" },
  { value: "dropped", label: "Dropped", color: "red" },
];

export const GENDERS = ["Male", "Female", "Other"];

export const CIVIL_STATUSES = ["Single", "Married", "Widowed", "Separated"];

export const USER_ROLES = [
  { value: "admin", label: "Admin", description: "Full access — manage users, students, and system settings" },
  { value: "staff", label: "Staff", description: "Can add, edit students. Cannot delete or manage users" },
  { value: "viewer", label: "Viewer", description: "Read-only access to student records" },
];
