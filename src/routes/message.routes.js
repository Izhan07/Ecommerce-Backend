import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { getMessagedTo, getMessages, sendMessage } from "../controllers/message.controller.js";

const router = Router();

router.route("/send").post(verifyJwt,
    upload.array("media"),
    sendMessage
)
router.route("/get-messages").get(verifyJwt, getMessages)
router.route("/profile/chats").get(verifyJwt, getMessagedTo)

export default router