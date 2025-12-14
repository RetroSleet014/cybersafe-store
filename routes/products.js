// routes/products.js
const express = require("express");
const router = express.Router();
const productsController = require("../controllers/productsController");
const { auth, isAdmin } = require("../middleware/authMiddleware");

// Público
router.get("/", productsController.getAllProducts);

// Admin
router.post("/", auth, isAdmin, productsController.createProduct);
router.put("/:id", auth, isAdmin, productsController.updateProduct);    
router.delete("/:id", auth, isAdmin, productsController.deleteProduct);

module.exports = router;