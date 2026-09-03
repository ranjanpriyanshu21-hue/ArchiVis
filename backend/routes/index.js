import { Router } from "express";
import designRoutes from "./designRoutes.js";
import architectRoutes from "./architectRoutes.js";
import catalogRoutes from "./catalogRoutes.js";
import authRoutes from "./authRoutes.js";
import favoriteRoutes from "./favoriteRoutes.js";
import inquiryRoutes from "./inquiryRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = Router();

router.get("/health", (req, res) => res.json({ status: "ok", service: "archivis-api" }));
router.use("/designs", designRoutes);
router.use("/architects", architectRoutes);
router.use("/auth", authRoutes);
router.use("/favorites", favoriteRoutes);
router.use("/ai", aiRoutes);
router.use("/", catalogRoutes);
router.use("/", inquiryRoutes);

export default router;
