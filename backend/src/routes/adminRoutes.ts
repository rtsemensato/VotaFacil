import { Router } from "express";
import { authenticateToken } from "../middlewares/authMiddleware";
import { listAllPolls, pollStatus } from "../controllers/adminController";
import { requireAdmin } from "../middlewares/adminMiddleware";

const router = Router();

router.get("/polls", authenticateToken, requireAdmin, listAllPolls);
router.get("/polls/:id/status", authenticateToken, requireAdmin, pollStatus);

export default router;
