// controllers/productsController.js
const db = require("../db");

const getAllProducts = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      "SELECT id, name, price, stock, created_at FROM products ORDER BY id ASC"
    );
    res.json(rows);
  } catch (err) { next(err); }
};

const createProduct = async (req, res, next) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) return res.status(400).json({ msg: "Datos incompletos" });

    await db.query("INSERT INTO products (name, price, stock) VALUES (?, ?, ?)", [name, price, stock]);
    res.json({ msg: "Producto creado" });
  } catch (err) { next(err); }
};

//Actualizar
const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, stock } = req.body;
    
    await db.query(
      "UPDATE products SET name = ?, price = ?, stock = ? WHERE id = ?",
      [name, price, stock, id]
    );
    res.json({ msg: "Producto actualizado" });
  } catch (err) { next(err); }
};

//eliminar
const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM products WHERE id = ?", [id]);
    res.json({ msg: "Producto eliminado" });
  } catch (err) { next(err); }
};

module.exports = { getAllProducts, createProduct, updateProduct, deleteProduct };