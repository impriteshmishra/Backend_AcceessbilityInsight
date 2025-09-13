import express from "express";
import { createUser, getUser } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/get/:clerkId").get(authMiddleware,getUser)


export default router;