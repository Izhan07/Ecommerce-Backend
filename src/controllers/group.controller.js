import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Group } from "../models/group.model.js";
import { User } from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";


const createGroup = asyncHandler(async (req, res) => {

    const { name, description, membersIds } = req.body
    if(!name.trim()){
        throw new ApiError(400, "Group name required")
    }
    const members = JSON.parse(membersIds)
    if(!members || !Array.isArray(members) || !members.length === 0){
        throw new ApiError(400, "Group members required")
    }
    const invalidIds = [];
    for(let memberId of members){
        if(!isValidObjectId(memberId)){
           invalidIds.push(memberId)
        }
    }
    if(invalidIds.length > 0){
        throw new ApiError(400, `Invalid user ID ${invalidIds}`)
    }
    const user = await User.find({
        _id: {$in:members}
    })
    if(members.length !== user.length){
        throw new ApiError(401, "Some user does not exist")
    }
    const avatarLocalPath = req.file.path;
    let avatar;
    if(avatarLocalPath){
        avatar = await uploadOnCloudinary(avatarLocalPath)
    }

    const allMembers = [...new Set([req.user?._id.toString(), ...members])];
    const group = await Group.create({
        name,
        avatar: avatar.url || "",
        description: description || "",
        members: allMembers,
        admin: req.user._id
    })
    if(!group){
        throw new ApiError(500, "Something went wrong while creating group")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                group
            },
            "Group created successfully"
        )
    )
});


const addMembersToGroup = asyncHandler(async (req, res) => {
    const {membersIds} = req.body;
    const {groupId} = req.params;
    console.log(membersIds)
    if(!isValidObjectId(groupId)){
        throw new ApiError(400, "Invalid group Id")
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(401, "Group does not exist")
    }
    const members = membersIds
    let invalidMemberIds = []; 
    for(let memberId of members){
        if(!isValidObjectId(memberId)){
            invalidMemberIds.push(memberId)
        }
    };
    if(invalidMemberIds.length > 0){
        throw new ApiError(400, `invalid member id's ${invalidMemberIds}`)
    };
    const users = await User.find({
        _id:{$in: members}
    })
    if(users.lenght !== members.lenght){
        throw new ApiError(401, "some user does not exist")
    }
   for(let memberId of members){
    if(!group.members.includes(memberId)){
        group.members.push(memberId)
    }
   }
    const updatedGroup = await group.save({valiadteBeforeSave: false})

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                updatedGroup
            },
            "Members added Successfully"
        )
    )
});


const getUserGroups = asyncHandler(async (req, res) => {

    const group = await Group.find({
        $or:[
           { members: req.user?._id,},
           {admin: req.user?._id}
        ]
    });
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                group
            },
            "User Groups fetched successfully"
        )
    )

   
});


const getGroupDetails = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!isValidObjectId(groupId)) {
        throw new ApiError(400, "Invalid group ID");
    }

    const group = await Group.findById(groupId)
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    return res.status(200).json(
        new ApiResponse(200, group, "Group details fetched successfully")
    );
});


const removeMemberFromGroup = asyncHandler(async (req, res) => {

    const {groupId, memberId} = req.params;
    if(!isValidObjectId(groupId) || !isValidObjectId(memberId)){
        throw new ApiError(401, "Invalid User or group Id's")
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(401, "group does not exist")
    };
    if(group.admin.toString() !== req.user?._id.toString()){
        throw new ApiError(400, "Only admin can remove members")
    };
    group.members = group.members.filter(Id => Id.toString() !== memberId.toString())
    await group.save()
    return res
    .status(201)
    .json(
        new ApiResponse(
            200, 
            {
                group
            },
            "Group member removed successfully"
        )
    )
});


const deleteGroup = asyncHandler(async (req, res) => {
    const { groupId } = req.params;

    if (!isValidObjectId(groupId)) {
        throw new ApiError(400, "Invalid group ID");
    }

    const group = await Group.findById(groupId);
    if (!group) {
        throw new ApiError(404, "Group not found");
    }

    if (group.admin.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Only admin can delete the group");
    }

    await Group.deleteOne({ _id: groupId });

    return res.status(200).json(
        new ApiResponse(200, {}, "Group deleted successfully")
    );
});
const leaveGroup = asyncHandler( async (req, res) => {
    const {groupId} = req.params;
    if(!isValidObjectId(groupId)){
        throw new ApiError(401, "Invalid GroupId")
    };
    const group = await Group.findById(groupId);
    if(!group){
        throw new ApiError(401, "Group does not exist")
    };
    let updatedGroup;
    if(group.admin.toString() === req.user?._id.toString() ){
        if(!isValidObjectId(req.body.memberId[0])){
            throw new ApiError(401, "invalid user Id")
        }
        group.admin = req.body.memberId;
        group.members = group.members.filter(Id => Id.toString() !== req.user._id.toString);
        await group.save();
        updatedGroup = group;
    }
    group.members = group.members.filter(Id => Id.toString() !== req.user._id.toString())
    updatedGroup = await group.save();
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                updatedGroup
            },
            "Group leaved Successfully"
        )
    )
    
})

export {
    createGroup,
    addMembersToGroup,
    getUserGroups,
    getGroupDetails,
    removeMemberFromGroup,
    deleteGroup,
    leaveGroup
};
