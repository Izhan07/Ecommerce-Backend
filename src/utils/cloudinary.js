import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";



const uploadOnCloudinary = async (localFilePath)=>{
  try {
    if(!localFilePath) return null;

      await cloudinary.config({ 
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
          api_key: process.env.CLOUDINARY_API_KEY, 
          api_secret: process.env.CLOUDINARY_API_SECRET 
});


    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto"
    })
    if(!response){
      console.log("something went wrong while uploading file on cloudinary")
      return null
    }else{
      fs.unlinkSync(localFilePath)
      console.log("File Uploaded Successfully ",response.url)
      return response
    }
  } catch (error) {
    console.error("Cloudinary Upload failed", error)
    fs.unlinkSync(localFilePath)
    return null
  }
}
export {uploadOnCloudinary}