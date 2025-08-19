// src/models/Product.js
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Product title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    lowercase: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  mrp: {
    type: Number,
    min: [0, 'MRP cannot be negative'],
    validate: {
      validator: function(v) {
        return !v || v >= this.price;
      },
      message: 'MRP should be greater than or equal to selling price'
    }
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,   // ✅ creates unique index automatically
    trim: true,
    uppercase: true
  },
  barcode: {
    type: String,
    trim: true,
    unique: true,   // ✅ ensures uniqueness if present
    sparse: true    // ✅ allows null values
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String, // For Cloudinary
    alt: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  weight: Number, // in grams
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.inStock = ret.stock > 0;
      ret.discount = ret.mrp && ret.price < ret.mrp
        ? Math.round(((ret.mrp - ret.price) / ret.mrp) * 100)
        : 0;
      return ret;
    }
  }
});

// ✅ Optimized indexes (removed duplicate barcode index)
productSchema.index({ title: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
