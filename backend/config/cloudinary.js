import coudinary from "cloudinary";
import { cloudinary_api_key, cloudinary_api_secret, cloudinary_name } from "./config.js";
coudinary.v2.config({
    cloud_name:cloudinary_name,
    api_key:cloudinary_api_key,
    api_secret:cloudinary_api_secret
})
export default coudinary.v2;