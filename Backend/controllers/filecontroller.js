const uploadFiles = async (req, res) => {
  try {
      // Check if a file was uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "No file uploaded." });
    }
    const fileName = req.files.map((file) => file.filename);
    console.log("filename", fileName)

      // Send success response
      res.status(200).json({
          message: "File uploaded successfully!",
          file: fileName,
      });
  } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Internal server error." });
  }
};

module.exports = { uploadFiles };
