import { findArchitectById, findArchitects } from "../models/architectModel.js";
import { findDesigns } from "../models/designModel.js";
import { HttpError } from "../middleware/errorHandler.js";
import { requireId } from "../middleware/validate.js";

export async function listArchitects(req, res) {
  const { q = "", style = "" } = req.query;
  const architects = await findArchitects({ search: String(q).trim(), style: String(style).trim() });
  res.json({ count: architects.length, architects });
}

export async function getArchitect(req, res) {
  const id = requireId(req.params.id, "architect id");
  const architect = await findArchitectById(id);
  if (!architect) throw new HttpError(404, "Architect not found");

  const portfolio = await findDesigns({ architectId: id, sort: "rating" });
  res.json({ architect, portfolio });
}
