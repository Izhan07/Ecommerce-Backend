import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import { Message } from "../models/message.model.js";
import { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const sendMessage = asyncHandler( async (req, res) => {
    const {reciverId} = req.params;
    if(!isValidObjectId(reciverId)){
        throw new ApiError(401, "Invalid User Object Id")
    }
    const { text } = req.body;
    const mediaLocalPath = req.files;
    console.log(mediaLocalPath)
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

export {
    sendMessage
}

