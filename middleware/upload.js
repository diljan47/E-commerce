const multer = require("multer");
const os = require("os");
const path = require("path");

const storage = multer.diskStorage({
  destination: os.tmpdir(), // Use the system's temporary directory
  filename: (req, file, cb) => {
    cb(null, new Date().getTime() + path.extname(file.originalname));
  },
});

// Update the multer configuration
const upload = multer({ storage: storage });

module.exports = upload;
