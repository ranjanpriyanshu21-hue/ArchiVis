import { HttpError } from "./errorHandler.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function requireFields(body, fields) {
  const missing = fields.filter((field) => {
    const value = body?.[field];
    return value === undefined || value === null || String(value).trim() === "";
  });
  if (missing.length > 0) {
    throw new HttpError(400, `Missing required field${missing.length > 1 ? "s" : ""}: ${missing.join(", ")}`);
  }
}

export function requireEmail(email) {
  if (!EMAIL_PATTERN.test(String(email).trim())) throw new HttpError(400, "A valid email address is required");
  return String(email).trim().toLowerCase();
}

export function requireId(value, label = "id") {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new HttpError(400, `Invalid ${label}`);
  return id;
}

export function optionalInt(value) {
  if (value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.trunc(parsed) : null;
}
