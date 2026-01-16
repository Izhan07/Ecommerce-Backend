import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/Apierror.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

const generateAccessAndRefreshTokens = async (userId)=>{
    try {
        const user = await User.findById(userId)
        if(!user) throw new ApiError(400, "Invalid UserId");
        const accessToken = await user.generateAccessToken();
        const refreshToken = await user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave: false})
        return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating tokens")
    }
}

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

const loginUser = asyncHandler( async (req, res) => {

    const {username, password} = req.body;

    if(!username) throw new ApiError(400, "username required");

    const user = await User.findOne({username});

    if(!user) throw new ApiError(400, "User not found");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid) throw new ApiError(400, "Invalid credentials");

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id);
      
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    const options = {
        httpOnly: true,
        secure: false
    }
    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200,
        {
            user: loggedInUser, accessToken, refreshToken,
        },
        "user LoggedIn Successfully"
    )
    )

})

const logoutUser = asyncHandler( async (req, res)=>{
     await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset:{
                refreshToken: 1,
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: false
    }

    return res
    .status(201)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
             200,
              {},
             "User loggedOut Successfully"
        )
    )
})

const refreshRefreshToken = asyncHandler( async (req, res)=>{
    const incommingToken = req.cookies.refreshToken || req.body.refreshToken;
    if(!incommingToken){
        throw new ApiError(401, "Unauthorized request")
    }

    const decodedToken = jwt.verify(incommingToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken._id);
    if(!user){
        throw new ApiError(401, "Unauthorized request")
    }
    if(incommingToken !== user?.refreshToken){
        throw new ApiError(401, "refresh token is expired or used")
    }
    const {accessToken, newRefreshToken} = await generateAccessAndRefreshTokens(user._id);
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .json(
       new ApiResponse(
         200,
        {
            accessToken,
           "refreshToken": newRefreshToken
        },
        "tokens refreshed successfully"
       )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshRefreshToken
}