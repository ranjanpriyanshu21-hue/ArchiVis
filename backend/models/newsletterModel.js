import { query } from "../config/db.js";

export async function subscribeEmail(email) {
  await query("INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)", [email]);
}
