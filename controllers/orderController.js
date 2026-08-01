// controllers/orderController.js
const crypto = require("crypto");
const Order = require("../models/Order");
const Cart = require("../models/Cart");

// GET all orders (own orders for normal user, all orders if admin)
exports.getAllOrders = async (req, res) => {
  try {
    const filter = req.user.role === "admin" ? {} : { userId: req.user.id };

    const orders = await Order.find(filter)
      .populate({
        path: "items.productId",
        select: "name price image",
      })
      .sort({ createdAt: -1 });

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// GET single order by ID
exports.getOrderById = async (req, res) => {
  try {
 const order = await Order.findById(req.params.id).populate({
  path: "items.productId",
  select: "name price image",
});
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// POST create order
exports.createOrder = async (req, res) => {
  try {
    const {
      address,
      items,
      paymentMethod,
      subtotal,
      shipping,
      total,
      cardLast4, // optional — only last 4 digits, never full card data
    } = req.body;

    if (
      !address ||
      !items ||
      items.length === 0 ||
      !paymentMethod ||
      total == null
    ) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // By the time this endpoint is called for an "online" order, the
    // (fake) payment gateway on the frontend has already reported success.
    // COD orders are paid later, on delivery.
    const isOnlinePayment = paymentMethod === "online";

    const order = await Order.create({
      userId: req.user.id,
      address,
      items,
      paymentMethod,
      paymentStatus: isOnlinePayment ? "Paid" : "Pending",
      transactionId: isOnlinePayment
        ? `TXN-${crypto.randomUUID()}`
        : null,
      paidAt: isOnlinePayment ? new Date() : null,
      cardLast4: isOnlinePayment && /^\d{4}$/.test(cardLast4 || "")
        ? cardLast4
        : null,
      subtotal,
      shipping,
      total,
      status: "Pending",
    });

    // Remove only the ordered products from the user's cart.
    // (Wiping the entire cart here would incorrectly clear unrelated
    // items when the order came from "Buy Now", which never touches the cart.)
    const orderedProductIds = items.map((item) => item.productId);

    await Cart.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { items: { product: { $in: orderedProductIds } } } }
    );

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// PUT update order
exports.updateOrder = async (req, res) => {
  try {
    const {
      address,
      items,
      paymentMethod,
      subtotal,
      shipping,
      total,
      status,
    } = req.body;

    const updateData = {
      address,
      items,
      paymentMethod,
      subtotal,
      shipping,
      total,
      status,
    };

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: "items.productId",
      select: "name price image",
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// PATCH update order status only
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        message: "Order not found",
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// DELETE order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};