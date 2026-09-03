import bcrypt from "bcryptjs";
import { pool } from "../config/db.js";
import { ARCHITECTS, DESIGNS, STYLE_TAGS, TESTIMONIALS } from "./seedData.js";

const DEMO_USER = { name: "Demo User", email: "demo@archivis.dev", password: "password123" };

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function seed() {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    for (const table of [
      "favorites",
      "inquiries",
      "testimonials",
      "newsletter_subscribers",
      "design_materials",
      "design_tags",
      "design_images",
      "designs",
      "architect_awards",
      "architect_specialties",
      "architects",
      "styles",
      "users",
    ]) {
      await connection.query(`TRUNCATE TABLE ${table}`);
    }
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // Styles — "All" is a UI-only filter chip, not a stored style. The STYLE_TAGS order is
    // preserved so the filter bar renders exactly as before.
    const filterStyles = STYLE_TAGS.filter((s) => s !== "All");
    const styleNames = [...new Set([...filterStyles, ...DESIGNS.map((d) => d.style)])];
    const styleIdByName = new Map();
    for (const [index, name] of styleNames.entries()) {
      const isFilter = filterStyles.includes(name);
      const [result] = await connection.execute(
        "INSERT INTO styles (name, slug, is_filter, sort_order) VALUES (?, ?, ?, ?)",
        [name, slugify(name), isFilter ? 1 : 0, isFilter ? filterStyles.indexOf(name) : 100 + index]
      );
      styleIdByName.set(name, result.insertId);
    }

    // Architects (ids preserved so existing frontend links keep working)
    for (const architect of ARCHITECTS) {
      await connection.execute(
        `INSERT INTO architects
           (id, name, title, firm, location, experience_years, rating, reviews_count, projects_count,
            image_url, bio, starting_budget, phone, email, website, instagram)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          architect.id,
          architect.name,
          architect.title,
          architect.firm,
          architect.location,
          architect.experience,
          architect.rating,
          architect.reviews,
          architect.projects,
          architect.image,
          architect.bio,
          architect.startingBudget,
          architect.phone,
          architect.email,
          architect.website,
          architect.instagram,
        ]
      );

      for (const specialty of architect.specialties) {
        if (!styleIdByName.has(specialty)) {
          const [result] = await connection.execute(
            "INSERT INTO styles (name, slug, is_filter, sort_order) VALUES (?, ?, 0, ?)",
            [specialty, slugify(specialty), 100 + styleIdByName.size]
          );
          styleIdByName.set(specialty, result.insertId);
        }
        await connection.execute(
          "INSERT INTO architect_specialties (architect_id, style_id) VALUES (?, ?)",
          [architect.id, styleIdByName.get(specialty)]
        );
      }

      for (const [index, award] of architect.awards.entries()) {
        await connection.execute(
          "INSERT INTO architect_awards (architect_id, title, sort_order) VALUES (?, ?, ?)",
          [architect.id, award, index]
        );
      }
    }

    // Designs
    for (const design of DESIGNS) {
      await connection.execute(
        `INSERT INTO designs
           (id, title, slug, style_id, architect_id, budget_label, budget_amount, location, rating,
            reviews_count, featured, image_url, description, bedrooms, bathrooms, area_label, timeline_label)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          design.id,
          design.title,
          slugify(design.title),
          styleIdByName.get(design.style),
          design.architectId,
          design.budget,
          design.budgetNum,
          design.location,
          design.rating,
          design.reviews,
          design.featured ? 1 : 0,
          design.image,
          design.description,
          design.bedrooms,
          design.bathrooms,
          design.area,
          design.timeline,
        ]
      );

      for (const [index, url] of design.gallery.entries()) {
        await connection.execute(
          "INSERT INTO design_images (design_id, url, sort_order) VALUES (?, ?, ?)",
          [design.id, url, index]
        );
      }
      for (const tag of design.tags) {
        await connection.execute("INSERT INTO design_tags (design_id, tag) VALUES (?, ?)", [design.id, tag]);
      }
      for (const [index, material] of design.materials.entries()) {
        await connection.execute(
          "INSERT INTO design_materials (design_id, material, sort_order) VALUES (?, ?, ?)",
          [design.id, material, index]
        );
      }
    }

    // Testimonials — linked to a design when the project name matches
    const designIdByTitle = new Map(DESIGNS.map((d) => [d.title, d.id]));
    for (const [index, testimonial] of TESTIMONIALS.entries()) {
      await connection.execute(
        `INSERT INTO testimonials (id, name, location, rating, design_id, body, image_url, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testimonial.id,
          testimonial.name,
          testimonial.location,
          testimonial.rating,
          designIdByTitle.get(testimonial.project) ?? null,
          testimonial.text,
          testimonial.image,
          index,
        ]
      );
    }

    // Demo account so favorites can be tried immediately
    const passwordHash = await bcrypt.hash(DEMO_USER.password, 10);
    const [userResult] = await connection.execute(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
      [DEMO_USER.name, DEMO_USER.email, passwordHash]
    );
    for (const designId of [1, 3, 7]) {
      await connection.execute("INSERT INTO favorites (user_id, design_id) VALUES (?, ?)", [
        userResult.insertId,
        designId,
      ]);
    }

    await connection.commit();
    console.log(
      `Seeded ${styleIdByName.size} styles, ${ARCHITECTS.length} architects, ${DESIGNS.length} designs, ` +
        `${TESTIMONIALS.length} testimonials and the demo account ${DEMO_USER.email} / ${DEMO_USER.password}.`
    );
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
