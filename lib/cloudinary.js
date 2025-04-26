import { v2 as cloudinary } from 'cloudinary'; // Correctly alias 'v2' as 'cloudinary'
import dotenv from 'dotenv';

dotenv.config(); // Ensure environment variables are loaded

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export default cloudinary;