import multer from "multer";

const storage = multer.memoryStorage();

const allowedImageTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const allowedAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/mp4", "audio/m4a"];

const fileFilter = (allowedTypes) => (req, file, cb) => {
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Unsupported file type"));
  }
  cb(null, true);
};

export const imageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(allowedImageTypes),
});

export const audioUpload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 },
  fileFilter: fileFilter(allowedAudioTypes),
});
