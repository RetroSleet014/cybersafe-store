//routes/orders.js
const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const { listMyOrders, listAllOrders } = require("../controllers/ordersController");

//Ver mis órdenes (requiere estar logueado)
router.get("/", auth, listMyOrders);

module.exports = router;