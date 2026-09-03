import { query } from "../config/db.js";

const BASE_SELECT = `
  SELECT a.id, a.name, a.title, a.firm, a.location, a.experience_years, a.rating, a.reviews_count,
         a.projects_count, a.image_url, a.bio, a.starting_budget, a.phone, a.email, a.website, a.instagram
  FROM architects a
`;

function mapArchitect(row) {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    firm: row.firm,
    location: row.location,
    experience: row.experience_years,
    rating: Number(row.rating),
    reviews: row.reviews_count,
    projects: row.projects_count,
    image: row.image_url,
    bio: row.bio,
    startingBudget: row.starting_budget,
    phone: row.phone,
    email: row.email,
    website: row.website,
    instagram: row.instagram,
  };
}

async function attachRelations(architects) {
  if (architects.length === 0) return architects;
  const ids = architects.map((a) => a.id);
  const placeholders = ids.map(() => "?").join(",");

  const [specialties, awards, portfolio] = await Promise.all([
    query(
      `SELECT sp.architect_id, s.name
       FROM architect_specialties sp
       JOIN styles s ON s.id = sp.style_id
       WHERE sp.architect_id IN (${placeholders})
       ORDER BY s.name`,
      ids
    ),
    query(
      `SELECT architect_id, title FROM architect_awards WHERE architect_id IN (${placeholders}) ORDER BY sort_order`,
      ids
    ),
    query(`SELECT architect_id, id FROM designs WHERE architect_id IN (${placeholders}) ORDER BY id`, ids),
  ]);

  const byId = new Map(architects.map((a) => [a.id, a]));
  for (const architect of architects) {
    architect.specialties = [];
    architect.awards = [];
    architect.portfolioIds = [];
  }
  for (const row of specialties) byId.get(row.architect_id).specialties.push(row.name);
  for (const row of awards) byId.get(row.architect_id).awards.push(row.title);
  for (const row of portfolio) byId.get(row.architect_id).portfolioIds.push(row.id);

  return architects;
}

export async function findArchitects({ search = "", style = "" } = {}) {
  const where = [];
  const params = [];
  let join = "";

  if (search) {
    where.push("(a.name LIKE ? OR a.location LIKE ? OR a.firm LIKE ?)");
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (style && style !== "All") {
    join = `
      JOIN architect_specialties sp ON sp.architect_id = a.id
      JOIN styles s ON s.id = sp.style_id
    `;
    where.push("s.name = ?");
    params.push(style);
  }

  const sql =
    BASE_SELECT + join + (where.length ? ` WHERE ${where.join(" AND ")}` : "") + " ORDER BY a.rating DESC, a.id ASC";

  const rows = await query(sql, params);
  return attachRelations(rows.map(mapArchitect));
}

export async function findArchitectById(id) {
  const rows = await query(`${BASE_SELECT} WHERE a.id = ?`, [id]);
  if (rows.length === 0) return null;
  const [architect] = await attachRelations([mapArchitect(rows[0])]);
  return architect;
}
