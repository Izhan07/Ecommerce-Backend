import { Router } from "express";
import { toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/c/:username").post(verifyJwt, toggleSubscription)
export default router