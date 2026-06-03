import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || process.env.Cloudinary_name,
  api_key: process.env.CLOUDINARY_API_KEY || process.env.Cloudinary_api_key,
  api_secret: process.env.CLOUDINARY_API_SECRET || process.env.Cloudinary_api_secret,
});

export default cloudinary;
