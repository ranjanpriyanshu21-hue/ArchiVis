import { Router } from "express";
import { getDesign, listDesigns } from "../controllers/designController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/", asyncHandler(listDesigns));
router.get("/:id", asyncHandler(getDesign));

export default router;
