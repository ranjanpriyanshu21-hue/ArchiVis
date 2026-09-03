import { Router } from "express";
import { listStyles, listTestimonials } from "../controllers/catalogController.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.get("/styles", asyncHandler(listStyles));
router.get("/testimonials", asyncHandler(listTestimonials));

export default router;
