// routes/cart.js
const express = require("express");
const router = express.Router();

const { auth } = require("../middleware/authMiddleware");
const { checkout } = require("../controllers/cartController");

// Checkout (compra real): descuenta inventario y crea orden (o declina)
router.post("/checkout", auth, checkout);

module.exports = router;
