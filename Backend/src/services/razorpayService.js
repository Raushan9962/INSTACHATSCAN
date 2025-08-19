const Razorpay = require("razorpay");
const crypto = require("crypto");

// Ensure Razorpay credentials are present
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay credentials missing. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env");
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "",
});

// Create Razorpay order
const createRazorpayOrder = async (order) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured");
    }

    const options = {
      amount: Math.round(order.totalAmount * 100), // Amount in paise
      currency: "INR",
      receipt: order.orderId,
      notes: {
        orderId: order.orderId,
        userId: order.userId.toString(),
      },
    };

    const razorpayOrder = await razorpay.orders.create(options);

    return {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      receipt: razorpayOrder.receipt,
    };
  } catch (error) {
    console.error("❌ Razorpay order creation error:", error.message);
    throw new Error("Failed to create Razorpay order: " + error.message);
  }
};

// Verify Razorpay webhook signature
const verifyRazorpaySignature = (body, signature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay webhook secret not configured");
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(JSON.stringify(body))
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("❌ Signature verification error:", error.message);
    return false;
  }
};

// Verify payment details (from frontend callback)
const verifyPaymentDetails = (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay secret not configured");
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    return expectedSignature === razorpaySignature;
  } catch (error) {
    console.error("❌ Payment verification error:", error.message);
    return false;
  }
};

module.exports = {
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyPaymentDetails,
};
