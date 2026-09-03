import { Router } from "express";
import { createFavorite, deleteFavorite, listFavorites, syncFavorites } from "../controllers/favoriteController.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.use(requireAuth);
router.get("/", asyncHandler(listFavorites));
router.post("/", asyncHandler(createFavorite));
router.post("/sync", asyncHandler(syncFavorites));
router.delete("/:designId", asyncHandler(deleteFavorite));

export default router;
