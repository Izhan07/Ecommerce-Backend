import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sendMessage = asyncHandler( async (req, res) => {
    const {reciverId} = req.params;
    if(!isValidObjectId(reciverId)){
        throw new ApiError(401, "Invalid User Object Id")
    }
    const { text } = req.body;
    const mediaLocalPath = req.files;
    if(!text.trim() && (!mediaLocalPath || mediaLocalPath.length === 0)){
        throw new ApiError(400, "Content required")
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
    const message = await Message.create({
        sender: req.user?._id,
        reciver: reciverId,
        text: text || "",
        media: media
    })
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
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(401, "Invalid user Object Id")
    }
    const messages = await Message.aggregate([
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
    const profiles = await Message.aggregate([
        {
            $match:{
                sender: new mongoose.Types.ObjectId(user._id)
            },
           
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

