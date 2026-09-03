import { Router } from "express";
import { match } from "../controllers/aiController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/match", asyncHandler(match));

export default router;
