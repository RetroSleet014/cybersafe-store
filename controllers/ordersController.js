// controllers/ordersController.js
const db = require("../db");

// Usuario: ver sus órdenes
const listMyOrders = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ msg: "No autenticado" });

    const [orders] = await db.query(
      `SELECT
         o.id, o.total, o.status, o.created_at,
         o.payment_status, o.payment_brand, o.payment_last4, o.payment_token, o.payment_txn_id
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.id DESC`,
      [userId]
    );

    return res.json({ orders });
  } catch (err) {
    next(err);
  }
};

// Admin: ver todas las órdenes
const listAllOrders = async (req, res, next) => {
  try {
    // Si tienes tabla users, puedes mostrar email:
    // Si no la tienes, quita el LEFT JOIN y u.email
    const [orders] = await db.query(
      `SELECT
         o.id, o.user_id, u.email,
         o.total, o.status, o.created_at,
         o.payment_status, o.payment_brand, o.payment_last4, o.payment_token, o.payment_txn_id
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.id DESC`
    );

    return res.json({ orders });
  } catch (err) {
    next(err);
  }
};

module.exports = { listMyOrders, listAllOrders };
