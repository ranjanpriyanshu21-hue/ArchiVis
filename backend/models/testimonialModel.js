import { query } from "../config/db.js";

export async function findTestimonials() {
  const rows = await query(
    `SELECT t.id, t.name, t.location, t.rating, t.body, t.image_url, d.title AS project
     FROM testimonials t
     LEFT JOIN designs d ON d.id = t.design_id
     ORDER BY t.sort_order, t.id`
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    location: row.location,
    rating: row.rating,
    project: row.project,
    text: row.body,
    image: row.image_url,
  }));
}
