import { Router } from "express";
import { getArchitect, listArchitects } from "../controllers/architectController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", asyncHandler(listArchitects));
router.get("/:id", asyncHandler(getArchitect));

export default router;
