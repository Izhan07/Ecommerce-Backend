import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getMessagedTo, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.route("/m/:reciverId").post(verifyJwt,
    upload.array("media"),
    sendMessage
)
router.route("/g/:userId").get(verifyJwt, getMessages)
router.route("/profile/chats").get(verifyJwt, getMessagedTo)

export default router