import { query } from "../config/db.js";

export async function createInquiry({ name, email, subject, message, architectId = null, userId = null }) {
  const result = await query(
    `INSERT INTO inquiries (name, email, subject, message, architect_id, user_id)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [name, email, subject, message, architectId, userId]
  );
  return { id: result.insertId, name, email, subject, message, architectId, userId, status: "new" };
}
