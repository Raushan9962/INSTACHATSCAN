const Product = require('../models/Product');

// 📌 Get all products
const getProducts = async (req, res) => {
  try {
    const { q, category, sort = 'newest', page = 1, limit = 20, inStock } = req.query;

    const filter = { isActive: true };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category.toLowerCase();
    if (inStock !== undefined) filter.stock = inStock ? { $gt: 0 } : 0;

    let sortObj = {};
    switch (sort) {
      case 'price_asc': sortObj = { price: 1 }; break;
      case 'price_desc': sortObj = { price: -1 }; break;
      case 'oldest': sortObj = { createdAt: 1 }; break;
      case 'name_asc': sortObj = { title: 1 }; break;
      case 'name_desc': sortObj = { title: -1 }; break;
      default: sortObj = { createdAt: -1 };
    }
    if (q) sortObj = { score: { $meta: 'textScore' }, ...sortObj };

    const skip = (page - 1) * limit;

    const [products, totalCount, categories] = await Promise.all([
      Product.find(filter).sort(sortObj).skip(skip).limit(parseInt(limit)).lean(),
      Product.countDocuments(filter),
      Product.distinct('category', { isActive: true })
    ]);

    res.json({
      message: 'Products retrieved successfully',
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNextPage: page < Math.ceil(totalCount / limit),
          hasPreviousPage: page > 1,
          limit: parseInt(limit)
        },
        filters: {
          categories: categories.sort(),
          appliedFilters: { search: q || null, category: category || null, inStock: inStock || null, sort }
        }
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Failed to retrieve products' });
  }
};

// 📌 Get single product
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found', code: 'PRODUCT_NOT_FOUND' });

    await Product.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({ message: 'Product retrieved successfully', data: product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Failed to retrieve product' });
  }
};

// 📌 Create product
const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    if (await Product.findOne({ sku: productData.sku }))
      return res.status(400).json({ message: 'Product with this SKU already exists', code: 'DUPLICATE_SKU' });

    if (productData.barcode && await Product.findOne({ barcode: productData.barcode }))
      return res.status(400).json({ message: 'Product with this barcode already exists', code: 'DUPLICATE_BARCODE' });

    if (productData.mrp && productData.mrp < productData.price)
      return res.status(400).json({ message: 'MRP should be >= price', code: 'INVALID_MRP' });

    const product = new Product(productData);
    await product.save();

    res.status(201).json({ message: 'Product created successfully', data: product });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

// 📌 Update product
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const updates = { ...req.body };

    const existing = await Product.findById(productId);
    if (!existing) return res.status(404).json({ message: 'Product not found', code: 'PRODUCT_NOT_FOUND' });

    if (updates.sku && updates.sku !== existing.sku) {
      if (await Product.findOne({ sku: updates.sku, _id: { $ne: productId } }))
        return res.status(400).json({ message: 'Duplicate SKU', code: 'DUPLICATE_SKU' });
    }

    if (updates.barcode && updates.barcode !== existing.barcode) {
      if (await Product.findOne({ barcode: updates.barcode, _id: { $ne: productId } }))
        return res.status(400).json({ message: 'Duplicate barcode', code: 'DUPLICATE_BARCODE' });
    }

    const newPrice = updates.price ?? existing.price;
    const newMRP = updates.mrp ?? existing.mrp;
    if (newMRP && newMRP < newPrice)
      return res.status(400).json({ message: 'MRP should be >= price', code: 'INVALID_MRP' });

    const updated = await Product.findByIdAndUpdate(productId, { $set: updates }, { new: true, runValidators: true });
    res.json({ message: 'Product updated successfully', data: updated });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

// 📌 Delete product (soft delete)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found', code: 'PRODUCT_NOT_FOUND' });

    res.json({ message: 'Product deleted successfully', data: product });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// 📌 Scan product
const scanProduct = async (req, res) => {
  try {
    const { barcode, sku } = req.body;
    if (!barcode && !sku) return res.status(400).json({ message: 'Barcode or SKU required', code: 'MISSING_IDENTIFIER' });

    const product = await Product.findOne({
      $or: [
        ...(barcode ? [{ barcode }] : []),
        ...(sku ? [{ sku: sku.toUpperCase() }] : [])
      ]
    });

    if (product) return res.json({ message: 'Product found', data: { found: true, product } });

    const template = { title: '', description: '', category: '', price: 0, mrp: 0, stock: 0, sku: sku?.toUpperCase() || '', barcode: barcode || '', images: [], isActive: true };
    res.json({ message: 'Product not found - template provided', data: { found: false, template, scannedCode: barcode || sku } });
  } catch (error) {
    console.error('Scan product error:', error);
    res.status(500).json({ message: 'Failed to scan product' });
  }
};

// 📌 Upload product images
const uploadProductImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) return res.status(400).json({ message: 'No images uploaded' });

    const imagePaths = req.files.map(file => `/uploads/products/${file.filename}`);
    res.json({ message: 'Images uploaded successfully', data: { images: imagePaths } });
  } catch (error) {
    console.error('Upload product images error:', error);
    res.status(500).json({ message: 'Failed to upload product images' });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, scanProduct, uploadProductImages };
