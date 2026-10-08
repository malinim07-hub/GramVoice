const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gramvoice",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      uploadStream.end(req.file.buffer);
    });

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl: result.secure_url,
      filename: result.public_id,
    });
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);

    res.status(500).json({
      message: "Server error while uploading image",
    });
  }
};

module.exports = {
  uploadImage,
};