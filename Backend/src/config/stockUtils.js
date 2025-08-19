const Product = require('../models/Product');

const restoreOrderStock = async (order) => {
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.qty } }
      );
    }
    console.log('Stock restored for cancelled order:', order.orderId);
  } catch (error) {
    console.error('Stock restore failed:', error);
  }
};

module.exports = { restoreOrderStock };
