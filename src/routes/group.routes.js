import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js"
import { upload } from "../middlewares/multer.middleware.js";
import {
    createGroup,
    addMembersToGroup,
    getUserGroups,
    getGroupDetails,
    removeMemberFromGroup,
    deleteGroup,
    leaveGroup
} from "../controllers/group.controller.js";

const router = Router();

router.use(verifyJwt); // All routes require authentication

// Create a new group
router.post(
    "/create",
    upload.single("avatar"),
    createGroup
);

router.get("/user-groups", getUserGroups);


router.get("/:groupId", getGroupDetails);


router.post("/:groupId/add-members", addMembersToGroup);


router.delete("/:groupId/remove-member/:memberId", removeMemberFromGroup);

router.delete("/:groupId", deleteGroup);

router.route("/leave/:groupId").delete(leaveGroup)

export default router;
