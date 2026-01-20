import { Router } from "express";
import { changePassword, getCurrentUser, getUserChannelProfile, loginUser, logoutUser, refreshRefreshToken, registerUser, updateAccountDetails, updateAvatar } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
    ]),
    registerUser
)

router.route("/login").post(loginUser)
router.route("/logout").post(verifyJwt, logoutUser)
router.route("/refresh-token").get(refreshRefreshToken)
router.route("/change-password").post(verifyJwt, changePassword)
router.route("/current-user").get(verifyJwt, getCurrentUser)
router.route("/update-account").patch(verifyJwt, updateAccountDetails)
router.route("/avatar").patch(verifyJwt, upload.single("avatar"), updateAvatar)
router.route("/c/:username").get(verifyJwt, getUserChannelProfile)
export default router