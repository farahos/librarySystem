import cloudinary from "../config/cloudinary.js";

const uploadBuffer = (file, options) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(file.buffer);
  });

export async function uploadImage(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    const result = await uploadBuffer(req.file, {
      folder: "madal/covers",
      resource_type: "image",
      transformation: [{ width: 900, height: 1350, crop: "fill", gravity: "auto", quality: "auto", fetch_format: "auto" }],
    });

    res.status(201).json({
      secureUrl: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function uploadAudio(req, res) {
  try {
    if (!req.file) return res.status(400).json({ message: "Audio file is required" });

    const result = await uploadBuffer(req.file, {
      folder: "madal/audio",
      resource_type: "video",
    });

    res.status(201).json({
      secureUrl: result.secure_url,
      publicId: result.public_id,
      fileType: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
