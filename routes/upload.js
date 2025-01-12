const express = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload');
const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './public/uploads'); // Directory to store files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Add unique suffix
  },
});

// Multer middleware
const upload = multer({ storage });

// Routes
router.get('/', uploadController.getUploadPage);
router.post('/', upload.single('file'), uploadController.uploadFile);
router.get('/files', uploadController.getFiles);

module.exports = router;
