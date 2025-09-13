import express from 'express';
import fetchRecentUrl from '../controllers/fetchRecentUrl.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route("/url").post(authMiddleware,fetchRecentUrl);

export default router;