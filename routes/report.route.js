import express from 'express';

import { downloadReport } from '../controllers/report.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route("/download").post(authMiddleware,downloadReport)
// router.route("/email")

export default router;