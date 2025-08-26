import { v2 as cloudinary} from "cloudinary"
import fs from "fs"
import  config  from "./config.js"

// console.log(process.env.CLOUD_NAME)
// console.log(process.env.API_KEY)
// console.log(process.env.API_SECRET)
cloudinary.config({
  cloud_name: config.cloudName, 
  api_key: config.apiKey,
  api_secret: config.apiSecret,
});

const uploadtocloudinay = async (localfilepath, resourceType = "auto") => {
  try {
    if(!localfilepath) return null;
    const response = await cloudinary.uploader.upload(localfilepath, {
      resource_type: resourceType
    });
    //console.log(`upload successfull The link is: ${response.secure_url}`)
    fs.unlinkSync(localfilepath);
    return response.secure_url;

    
  } catch (error) {
    console.error("Upload error:", error);
    // Only delete file if it exists
    if (fs.existsSync(localfilepath)) {
      fs.unlinkSync(localfilepath);
    }
    return null; // Return null instead of console.log
  }
  
}

export {uploadtocloudinay}