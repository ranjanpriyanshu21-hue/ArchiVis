import { query } from "../config/db.js";

const SORTS = {
  rating: "d.rating DESC, d.reviews_count DESC",
  "budget-low": "d.budget_amount ASC",
  "budget-high": "d.budget_amount DESC",
};

const BASE_SELECT = `
  SELECT d.id, d.title, d.slug, s.name AS style, d.budget_label, d.budget_amount, d.location,
         d.rating, d.reviews_count, d.architect_id, d.featured, d.image_url, d.description,
         d.bedrooms, d.bathrooms, d.area_label, d.timeline_label
  FROM designs d
  JOIN styles s ON s.id = d.style_id
`;

function mapDesign(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    style: row.style,
    budget: row.budget_label,
    budgetNum: Number(row.budget_amount),
    location: row.location,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    architectId: row.architect_id,
    featured: Boolean(row.featured),
    image: row.image_url,
    description: row.description,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    area: row.area_label,
    timeline: row.timeline_label,
  };
}

async function attachRelations(designs) {
  if (designs.length === 0) return designs;
  const ids = designs.map((d) => d.id);
  const placeholders = ids.map(() => "?").join(",");

  const [images, tags, materials] = await Promise.all([
    query(`SELECT design_id, url FROM design_images WHERE design_id IN (${placeholders}) ORDER BY sort_order`, ids),
    query(`SELECT design_id, tag FROM design_tags WHERE design_id IN (${placeholders}) ORDER BY id`, ids),
    query(
      `SELECT design_id, material FROM design_materials WHERE design_id IN (${placeholders}) ORDER BY sort_order`,
      ids
    ),
  ]);

  const byId = new Map(designs.map((d) => [d.id, d]));
  for (const design of designs) {
    design.gallery = [];
    design.tags = [];
    design.materials = [];
  }
  for (const row of images) byId.get(row.design_id).gallery.push(row.url);
  for (const row of tags) byId.get(row.design_id).tags.push(row.tag);
  for (const row of materials) byId.get(row.design_id).materials.push(row.material);

  return designs;
}

export async function findDesigns({
  search = "",
  style = "",
  maxBudget = null,
  minBudget = null,
  sort = "rating",
  featured = null,
  architectId = null,
  limit = null,
} = {}) {
  const where = [];
  const params = [];

  if (search) {
    where.push("(d.title LIKE ? OR d.location LIKE ? OR s.name LIKE ? OR d.description LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (style && style !== "All") {
    where.push("s.name = ?");
    params.push(style);
  }
  if (maxBudget !== null) {
    where.push("d.budget_amount <= ?");
    params.push(maxBudget);
  }
  if (minBudget !== null) {
    where.push("d.budget_amount >= ?");
    params.push(minBudget);
  }
  if (featured !== null) {
    where.push("d.featured = ?");
    params.push(featured ? 1 : 0);
  }
  if (architectId !== null) {
    where.push("d.architect_id = ?");
    params.push(architectId);
  }

  const sql =
    BASE_SELECT +
    (where.length ? ` WHERE ${where.join(" AND ")}` : "") +
    ` ORDER BY ${SORTS[sort] || SORTS.rating}` +
    (limit ? ` LIMIT ${Number(limit)}` : "");

  const rows = await query(sql, params);
  return attachRelations(rows.map(mapDesign));
}

export async function findDesignById(id) {
  const rows = await query(`${BASE_SELECT} WHERE d.id = ?`, [id]);
  if (rows.length === 0) return null;
  const [design] = await attachRelations([mapDesign(rows[0])]);
  return design;
}

export async function findSimilarDesigns(design, limit = 3) {
  const rows = await query(
    `${BASE_SELECT} WHERE s.name = ? AND d.id <> ? ORDER BY d.rating DESC LIMIT ${Number(limit)}`,
    [design.style, design.id]
  );
  return attachRelations(rows.map(mapDesign));
}

export async function findDesignsByIds(ids) {
  if (ids.length === 0) return [];
  const placeholders = ids.map(() => "?").join(",");
  const rows = await query(`${BASE_SELECT} WHERE d.id IN (${placeholders})`, ids);
  return attachRelations(rows.map(mapDesign));
}
