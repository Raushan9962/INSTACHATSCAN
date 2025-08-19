const { z } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation error',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code
          }))
        });
      }
      next(error);
    }
  };
};

// ✅ Common schemas
const schemas = {
  // Auth
  register: z.object({
    body: z.object({
      name: z.string().min(2).max(50).trim(),
      email: z.string().email().toLowerCase().trim(),
      password: z.string().min(6).max(100),
      role: z.enum(['ADMIN', 'CUSTOMER']).optional()
    })
  }),
  login: z.object({
    body: z.object({
      email: z.string().email().toLowerCase().trim(),
      password: z.string().min(1)
    })
  }),

  // Product
  createProduct: z.object({
    body: z.object({
      title: z.string().min(1).max(200).trim(),
      description: z.string().min(1).max(2000).trim(),
      category: z.string().min(1).toLowerCase().trim(),
      price: z.number().min(0),
      mrp: z.number().min(0).optional(),
      stock: z.number().int().min(0),
      sku: z.string().min(1).trim().toUpperCase(),
      barcode: z.string().optional(),
      tags: z.array(z.string()).optional(),
      weight: z.number().optional(),
      dimensions: z.object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional()
      }).optional()
    })
  }),
  updateProduct: z.object({
    body: z.object({
      title: z.string().min(1).max(200).trim().optional(),
      description: z.string().min(1).max(2000).trim().optional(),
      category: z.string().min(1).toLowerCase().trim().optional(),
      price: z.number().min(0).optional(),
      mrp: z.number().min(0).optional(),
      stock: z.number().int().min(0).optional(),
      sku: z.string().min(1).trim().toUpperCase().optional(),
      barcode: z.string().optional(),
      isActive: z.boolean().optional(),
      tags: z.array(z.string()).optional(),
      weight: z.number().optional(),
      dimensions: z.object({
        length: z.number().optional(),
        width: z.number().optional(),
        height: z.number().optional()
      }).optional()
    }),
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID')
    })
  }),

  // Cart
  addToCart: z.object({
    body: z.object({
      productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
      qty: z.number().int().min(1).max(100)
    })
  }),

  // Checkout
  createOrder: z.object({
    body: z.object({
      shippingAddress: z.object({
        fullName: z.string().min(2).max(100).trim(),
        phone: z.string().min(10).max(15).trim(),
        addressLine1: z.string().min(5).max(200).trim(),
        addressLine2: z.string().max(200).trim().optional(),
        city: z.string().min(2).max(50).trim(),
        state: z.string().min(2).max(50).trim(),
        pincode: z.string().regex(/^\d{6}$/, 'Invalid pincode')
      }),
      paymentMethod: z.enum(['ONLINE', 'COD']),
      deliveryNotes: z.string().max(500).optional()
    })
  }),

  // Queries
  productQuery: z.object({
    query: z.object({
      q: z.string().optional(),
      category: z.string().optional(),
      sort: z.enum(['price_asc', 'price_desc', 'newest', 'oldest', 'name_asc', 'name_desc']).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      inStock: z.string().transform(val => val === 'true').optional()
    })
  }),
  orderQuery: z.object({
    query: z.object({
      status: z.enum(['PENDING', 'PAID', 'COD_CONFIRMED', 'COMPLETED', 'CANCELLED']).optional(),
      page: z.string().regex(/^\d+$/).transform(Number).optional(),
      limit: z.string().regex(/^\d+$/).transform(Number).optional()
    })
  })
};

module.exports = { validate, schemas };
