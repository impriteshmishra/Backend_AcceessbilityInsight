import express from "express";
import scanUrl from "../controllers/scan.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/scan").post(authMiddleware ,scanUrl)


export default router;