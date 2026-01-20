import { Router } from "express";
import { getChannelfollowing, getChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router();
router.route("/c/:username").post(verifyJwt, toggleSubscription);
router.route("/subs/:username").get(getChannelSubscribers)
router.route("/f/:username").get(getChannelfollowing)
export default router