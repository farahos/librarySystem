import express from "express";
import { uploadAudio, uploadImage } from "../controllers/uploadController.js";
import { authenticate } from "../middleware/auth.js";
import { audioUpload, imageUpload } from "../middleware/upload.js";

const router = express.Router();

router.post("/image", authenticate, imageUpload.single("file"), uploadImage);
router.post("/audio", authenticate, audioUpload.single("file"), uploadAudio);

export default router;
