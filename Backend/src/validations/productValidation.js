const { z } = require('zod');

const productSchemas = {
  query: z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    sort: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    inStock: z.string().optional()
  }),
  create: z.object({
    body: z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      category: z.string(),
      price: z.number().positive(),
      mrp: z.number().positive().optional(),
      stock: z.number().int().nonnegative(),
      sku: z.string().toUpperCase(),
      barcode: z.string().optional()
    })
  }),
  update: z.object({
    body: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      price: z.number().positive().optional(),
      mrp: z.number().positive().optional(),
      stock: z.number().int().nonnegative().optional(),
      sku: z.string().toUpperCase().optional(),
      barcode: z.string().optional()
    })
  })
};

module.exports = { productSchemas };
