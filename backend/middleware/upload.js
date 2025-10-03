import multer from "multer";

const storage = multer.memoryStorage();

const Upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Liiska saxda ah ee MIME types
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",      // hubi in jpg la aqbalo
      "application/pdf", // PDF
      "audio/mpeg",     // MP3
      "audio/wav",      // WAV
      "audio/ogg",      // OGG
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("File type not allowed"));
    }

    cb(null, true);
  },
});

// Isticmaal marka labadaba image & PDF la rabo
export const uploadFields = Upload.fields([
  { name: "image", maxCount: 1 },
  { name: "pdf", maxCount: 1 },
  { name: "audio", maxCount: 1 } // Haddii aad rabto inaad ku darto audio
]);

export default Upload;
