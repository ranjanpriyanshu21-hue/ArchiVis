import { addFavorite, findFavoriteDesignIds, removeFavorite } from "../models/favoriteModel.js";
import { findDesignById, findDesignsByIds } from "../models/designModel.js";
import { HttpError } from "../middleware/errorHandler.js";
import { requireId } from "../middleware/validate.js";

export async function listFavorites(req, res) {
  const designIds = await findFavoriteDesignIds(req.user.id);
  const designs = await findDesignsByIds(designIds);
  // Preserve the "most recently saved first" order from the favorites table.
  const order = new Map(designIds.map((id, index) => [id, index]));
  designs.sort((a, b) => order.get(a.id) - order.get(b.id));
  res.json({ designIds, designs });
}

export async function createFavorite(req, res) {
  const designId = requireId(req.body?.designId, "designId");
  if (!(await findDesignById(designId))) throw new HttpError(404, "Design not found");

  await addFavorite(req.user.id, designId);
  const designIds = await findFavoriteDesignIds(req.user.id);
  res.status(201).json({ designIds });
}

export async function deleteFavorite(req, res) {
  const designId = requireId(req.params.designId, "designId");
  const removed = await removeFavorite(req.user.id, designId);
  if (!removed) throw new HttpError(404, "Favorite not found");

  const designIds = await findFavoriteDesignIds(req.user.id);
  res.json({ designIds });
}

export async function syncFavorites(req, res) {
  const incoming = Array.isArray(req.body?.designIds) ? req.body.designIds : [];
  for (const value of incoming) {
    const designId = Number(value);
    if (Number.isInteger(designId) && designId > 0 && (await findDesignById(designId))) {
      await addFavorite(req.user.id, designId);
    }
  }
  const designIds = await findFavoriteDesignIds(req.user.id);
  res.json({ designIds });
}
