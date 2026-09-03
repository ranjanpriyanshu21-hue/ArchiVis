import { query } from "../config/db.js";

export async function findFavoriteDesignIds(userId) {
  const rows = await query("SELECT design_id FROM favorites WHERE user_id = ? ORDER BY created_at DESC", [userId]);
  return rows.map((row) => row.design_id);
}

export async function addFavorite(userId, designId) {
  await query("INSERT IGNORE INTO favorites (user_id, design_id) VALUES (?, ?)", [userId, designId]);
}

export async function removeFavorite(userId, designId) {
  const result = await query("DELETE FROM favorites WHERE user_id = ? AND design_id = ?", [userId, designId]);
  return result.affectedRows > 0;
}
