import { findDesignById, findDesigns, findSimilarDesigns } from "../models/designModel.js";
import { findArchitectById } from "../models/architectModel.js";
import { HttpError } from "../middleware/errorHandler.js";
import { optionalInt, requireId } from "../middleware/validate.js";

export async function listDesigns(req, res) {
  const { q = "", style = "", sort = "rating", featured, architectId, limit, maxBudget, minBudget } = req.query;

  const designs = await findDesigns({
    search: String(q).trim(),
    style: String(style).trim(),
    maxBudget: optionalInt(maxBudget),
    minBudget: optionalInt(minBudget),
    sort: String(sort),
    featured: featured === undefined ? null : featured === "true" || featured === "1",
    architectId: optionalInt(architectId),
    limit: optionalInt(limit),
  });

  res.json({ count: designs.length, designs });
}

export async function getDesign(req, res) {
  const id = requireId(req.params.id, "design id");
  const design = await findDesignById(id);
  if (!design) throw new HttpError(404, "Design not found");

  const [architect, similar] = await Promise.all([
    findArchitectById(design.architectId),
    findSimilarDesigns(design, 3),
  ]);

  res.json({ design, architect, similar });
}
