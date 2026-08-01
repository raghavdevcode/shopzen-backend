const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const verifyToken = require("../middleware/verifyToken");
 
router.get("/", verifyToken, orderController.getAllOrders);
router.get("/:id", verifyToken, orderController.getOrderById);
router.post("/", verifyToken, orderController.createOrder);
router.put("/:id", verifyToken, orderController.updateOrder);
router.patch("/:id/status", verifyToken, orderController.updateOrderStatus);
router.delete("/:id", verifyToken, orderController.deleteOrder);
 
module.exports = router;