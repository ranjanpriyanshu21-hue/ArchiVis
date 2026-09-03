import { Router } from "express";
import { submitInquiry, subscribeNewsletter } from "../controllers/inquiryController.js";
import { optionalAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";

const router = Router();

router.post("/inquiries", optionalAuth, asyncHandler(submitInquiry));
router.post("/newsletter", asyncHandler(subscribeNewsletter));

export default router;
