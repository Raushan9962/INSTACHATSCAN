const express = require('express');
const router = express.Router();
const { uploadImages, deleteImage } = require('../controllers/uploadController');
const { auth, adminAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(auth);

// Upload images (Admin only)
router.post('/images', adminAuth, upload.array('images', 5), uploadImages);
router.delete('/images/:filename', adminAuth, deleteImage);

module.exports = router;

