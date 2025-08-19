const path = require('path');
const fs = require('fs').promises;

// Upload images
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded', code: 'NO_FILES' });
    }

    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const uploadedFiles = req.files.map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `${baseUrl}/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype
    }));

    res.json({ message: 'Files uploaded successfully', data: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    if (req.files) {
      req.files.forEach(async (file) => {
        try { await fs.unlink(file.path); } 
        catch (unlinkError) { console.error('Error deleting file:', unlinkError); }
      });
    }
    res.status(500).json({ message: 'Upload failed' });
  }
};

// Delete image
const deleteImage = async (req, res) => {
  try {
    const { filename } = req.params;
    const safeName = path.basename(filename);
    const filePath = path.join(process.env.UPLOAD_PATH || 'uploads/', safeName);

    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({ message: 'File not found', code: 'FILE_NOT_FOUND' });
    }

    await fs.unlink(filePath);
    res.json({ message: 'File deleted successfully', filename: safeName });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
};

module.exports = { uploadImages, deleteImage };
