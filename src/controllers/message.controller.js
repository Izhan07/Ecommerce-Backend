import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Group} from "../models/group.model.js"

const sendMessage = asyncHandler( async (req, res) => {
    const {reciverId} = req.body;
    const { text, groupId } = req.body;
    if(!reciverId && !groupId){
        throw new ApiError(400, "reciverId or groupId required")
    }
    if(reciverId && !isValidObjectId(reciverId)){
        throw new ApiError(400, "invalid reciverId")
    }
    const mediaLocalPath = req.files;
    if(!text.trim() && (!mediaLocalPath || mediaLocalPath.length === 0)){
        throw new ApiError(400, "Content required")
    }
    let group;
    let isGroup = false
    let messagedData = {
        text: text,
        sender: req.user?._id,
        reciver: reciverId,
        isGroup: isGroup
    }
    if(groupId){
        if(!isValidObjectId(groupId)){
            throw new ApiError(401, "Invalid group id")
        }
        group = await Group.findById(groupId)
    }
    let isMember;
    if(group){
      isMember = group.members.some(member => member.toString() === req.user?._id.toString());
      if(!isMember){
        throw new ApiError(400, "Only admins can send message")
      }else{
        messagedData.group = groupId,
        messagedData.isGroup = true
        messagedData.reciver = group.members.filter(Id => Id.toString() !== req.user?._id)
      }
    }
    let media = [];
    if(mediaLocalPath && mediaLocalPath.length > 0){
        for(let file of mediaLocalPath){
            const uploadedMedia = await uploadOnCloudinary(file.path);
            if(uploadedMedia?.url){
                media.push(uploadedMedia.url);
            }
        }
    }
    const message = await Message.create(messagedData)
    if(!message){
        throw new ApiError(500, "Something went wrong while sending message")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                message
            },
            "Message sent succesfully"
        )
    )
})

const getMessages = asyncHandler ( async (req, res) => {
    const {groupId, userId} = req.body;
    if(!userId && !groupId){
        throw new ApiError(400, "UserId or GroupId is required")
    }
    let messages;
    if(userId){
        if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid user Object Id ")
    }
         messages = await Message.aggregate([
        {
            $match:{
                $or:[
                    {
                        sender: new  mongoose.Types.ObjectId(req.user?._id),
                        reciver: new  mongoose.Types.ObjectId(userId)
                    },
                    {
                        sender: new  mongoose.Types.ObjectId(userId),
                        reciver: new mongoose.Types.ObjectId(req.user?._id)
                    }
                ]
            }
           
        },
        {
             $project:{
                text: 1,
                media: 1,
                sender: 1,
                reciver: 1
            }
        }
    ])
    }
    let group;
    if(groupId){
         if(!isValidObjectId(groupId)){
        throw new ApiError(401, "Invalid group Id ")
    }
    group = await Group.findOne({
        _id: groupId,
        members: req.user._id
    })
    }
    if(group){
        messages = await Message.aggregate([
            {
                $match:{
                    group: new mongoose.Types.ObjectId(groupId)
                }
            },
            {
                $lookup:{
                    from: "users",
                    localField: "sender",
                    foreignField: "_id",
                    as: "senders"
                }
            },
            {
                $unwind: "$senders"
            },
            {
                $project:{
                    text: 1,
                    media: 1,
                    _id: 1,
                    reciver: 1,
                    isGroup: 1,
                    sender:{
                        _id: "$senders._id",
                        username: "$senders.username",
                        avatar: "$senders.avatar"
                    }
                }
            }
        ])
    }
    
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                messages
            },
            "Messages fetched Successfully"
        )
    )

    
})

const getMessagedTo = asyncHandler( async (req, res) => {
    const user = req.user;
    if(!user){
        throw new ApiError(401, "invalid User")
    }
    const privateChats = await Message.aggregate([
        {
            $match:{
                isGroup: false,
                sender: new mongoose.Types.ObjectId(user._id)
            },
           
        },
        {
            $unwind: "$reciver"
        },
        {
            $group: {
                _id: "$reciver"
            }
        },
        {
             $lookup:{
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "profile"
            }
        },
        {
            $unwind: "$profile"
        },
        {
            $project:{
                "profile.avatar": 1,
                "profile.username": 1,
                "profile._id": 1
            }
        }
    ])

    const groupChats = await Message.aggregate([
        {
            $match:{
                isGroup: true,
                sender: new mongoose.Types.ObjectId(user._id)
            }
        },
        {
            $group:{
                _id: "$group"
            }
        },
        {
            $lookup:{
                from: "groups",
                localField: "_id",
                foreignField: "_id",
                as: "profile"
            }
        },
        {
            $unwind: "$profile"
        },
        {
            $project:{
                "profile.name": 1,
                "profile.avatar": 1,
                "profile._id": 1
            }
        }
    ])
    const profiles = [...privateChats, ...groupChats]

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                profiles
            },
            "chats fetched successfully"
        )
    )
})


export {
    sendMessage,
    getMessages,
    getMessagedTo
}

