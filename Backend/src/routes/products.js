const express = require('express');
const router = express.Router();

const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  scanProduct,
  uploadProductImages
} = require('../controllers/productController');

const { auth, adminAuth, optionalAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { upload } = require('../middleware/upload');
const { productSchemas } = require('../validations/productValidation');

// Public routes
router.get('/', validate(productSchemas.query), optionalAuth, getProducts);
router.get('/:id', getProduct);

// Protected routes
router.use(auth);

// Scan product
router.post('/scan', scanProduct);

// Upload product images
router.post('/upload-images', upload.array('images', 5), uploadProductImages);

// Admin only routes
router.use(adminAuth);
router.post('/', validate(productSchemas.create), createProduct);
router.put('/:id', validate(productSchemas.update), updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;
