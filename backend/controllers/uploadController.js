const path = require("path");
const fs = require("fs");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No image uploaded",
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      message: "Image uploaded successfully",
      imageUrl,
      filename: req.file.filename,
    });
  } catch (error) {
    console.error("Image Upload Error:", error);

    // Remove uploaded file if something goes wrong
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      message: "Server error while uploading image",
    });
  }
};

module.exports = {
  uploadImage,
};