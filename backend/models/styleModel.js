import { query } from "../config/db.js";

export async function findStyles({ filterOnly = true } = {}) {
  const rows = await query(
    `SELECT s.id, s.name, s.slug, s.is_filter, COUNT(d.id) AS design_count
     FROM styles s
     LEFT JOIN designs d ON d.style_id = s.id
     ${filterOnly ? "WHERE s.is_filter = 1" : ""}
     GROUP BY s.id, s.name, s.slug, s.is_filter, s.sort_order
     ORDER BY s.sort_order, s.id`
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    isFilter: Boolean(row.is_filter),
    designCount: Number(row.design_count),
  }));
}
