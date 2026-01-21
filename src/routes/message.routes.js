import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.route("/m/:reciverId").post(verifyJwt,
    upload.array("media"),
    sendMessage
)

export default router