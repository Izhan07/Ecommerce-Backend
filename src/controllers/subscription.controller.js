import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {Subscription} from "../models/subscription.model.js"
import { User } from "../models/user.model.js";
import { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler( async (req, res) => {
    const {username} = req.params
    console.log(username)
    if(!username?.trim()){
        throw new ApiError(400, "Invalid username")
    }
    const user = await User.findOne({
         username
    })
    if(!user){
        throw new ApiError(401, "user does not exist")
    }
    if(!isValidObjectId(user?._id) || !isValidObjectId(req.user?._id)){
        throw new ApiError(401, "Invalid ObjectId")
    }
    const checkSubscription = await Subscription.findOne({
        channel: user?._id,
        subscriber: req.user?._id
    })
    let subscribed;
    if(checkSubscription){
         subscribed = await Subscription.findByIdAndDelete(checkSubscription?._id)
    }else{
         subscribed = await Subscription.create({
            channel: user?._id,
            subscriber: req.user?._id
        })
    }
    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                subscribed
            },
            "User Subscribed Successfully"
        )
    )
})

const getChannelSubscribers = asyncHandler( async (req, res) => {
    const {username} = req.params
    if(!username.trim()){
        throw new ApiError(401, "Invalid Username")
    }
    const user = await User.findOne({
        username
    })
    if(!user){
        throw new ApiError(401, "user does exist")
    }
    const subscribers = await Subscription.find({
        channel: user._id,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                subscribers
            },
            "user Subscribers fetched successfully"
        )
    )
})

const getChannelfollowing = asyncHandler( async (req, res) => {
    const {username} = req.params
    if(!username.trim()){
        throw new ApiError(401, "Invalid Username")
    }
    const user = await User.findOne({
        username
    })
    if(!user){
        throw new ApiError(401, "user does exist")
    }
    const followings = await Subscription.find({
        subscriber: user._id,
    })

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            {
                followings
            },
            "user following fetched successfully"
        )
    )
})

export{
    toggleSubscription,
    getChannelSubscribers,
    getChannelfollowing
}