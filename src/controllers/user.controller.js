import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const registerUser = asyncHandler( async (req , res)=>{
    const {fullName, username, email, password } = req.body
    if(
        [fullName, username, email, password].some((field) => !field?.trim())
    ){
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{email}, {username} ]
    })

    if(existedUser){
        throw new ApiError(400, "username or email already exist")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400, "avatar required")
    }

    /*let coverImageLocalPAth;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0
    ){
        coverImageLocalPAth = req.files.coverImage[0].path
    }*/

    const avatar = await uploadOnCloudinary(avatarLocalPath);
   

    if(!avatar){
        throw new ApiError(500, "Avatar upload failed")
    }

    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        avatar: avatar.url,
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(200, "User Registerd Successfully")
    )
} )

export {
    registerUser
}