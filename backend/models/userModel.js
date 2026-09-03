import { query } from "../config/db.js";

export async function findUserByEmail(email) {
  const rows = await query("SELECT id, name, email, password_hash FROM users WHERE email = ?", [email]);
  return rows[0] || null;
}

export async function findUserById(id) {
  const rows = await query("SELECT id, name, email, created_at FROM users WHERE id = ?", [id]);
  return rows[0] || null;
}

export async function createUser({ name, email, passwordHash }) {
  const rows = await query("INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)", [
    name,
    email,
    passwordHash,
  ]);
  return { id: rows.insertId, name, email };
}
