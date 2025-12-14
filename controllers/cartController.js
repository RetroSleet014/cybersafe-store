const crypto = require("crypto");
const db = require("../db");

const BRANDS = ["VISA", "MASTERCARD", "AMEX", "DISCOVER"];
function randomBrand() { return BRANDS[Math.floor(Math.random() * BRANDS.length)]; }
function makeToken(prefix) { return `${prefix}_${crypto.randomBytes(16).toString("hex")}`; }

const checkout = async (req, res, next) => {
  const { items, payment } = req.body;
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ msg: "No autenticado" });
  if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ msg: "Carrito vacío" });

  const payment_status = payment?.status === "APPROVED" ? "APPROVED" : "DECLINED";
  const payment_last4 = String(payment?.last4 || "").slice(-4).padStart(4, "0");
  const payment_brand = randomBrand();
  const payment_token = makeToken("tok");
  const payment_txn_id = makeToken("txn");

  //Si el pago se declina (simulación)
  if (payment_status !== "APPROVED") {
    try {
      await db.query(`INSERT INTO orders (user_id, total, status, payment_status, payment_brand, payment_last4, payment_token, payment_txn_id) VALUES (?, 0, 'DECLINED', ?, ?, ?, ?, ?)`, [userId, payment_status, payment_brand, payment_last4, payment_token, payment_txn_id]);
    } catch(e) {}
    return res.status(402).json({ msg: "Pago declinado", payment: { payment_status } });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    let total = 0;
    const resolved = [];

    //Validar stock y preparar items
    for (const it of items) {
      const pid = Number(it.product_id);
      const qty = Number(it.qty);
      
      //Bloquear fila para evitar condiciones de carrera
      const [rows] = await conn.query("SELECT id, name, price, stock FROM products WHERE id = ? FOR UPDATE", [pid]);
      
      if (rows.length === 0) throw new Error(`Producto ${pid} no existe`);
      const p = rows[0];
      
      if (p.stock < qty) throw new Error(`Stock insuficiente para ${p.name}`);

      const price = Number(p.price);
      const subtotal = price * qty;
      total += subtotal;

      //Asignación manual explícita para evitar NULLs
      resolved.push({
        id: p.id,
        name: p.name,       // Forzamos la lectura del nombre
        price: price,       // Forzamos la lectura del precio
        qty: qty,
        subtotal: subtotal
      });
    }

    //Crear la Orden
    const [orderRes] = await conn.query(
      `INSERT INTO orders (user_id, total, status, payment_status, payment_brand, payment_last4, payment_token, payment_txn_id) VALUES (?, ?, 'PAID', ?, ?, ?, ?, ?)`,
      [userId, total, payment_status, payment_brand, payment_last4, payment_token, payment_txn_id]
    );
    const orderId = orderRes.insertId;

    //Insertar Items y Descontar Stock
    for (const r of resolved) {
      //Verificar que los datos existan antes de insertar
      if (!r.name || !r.price) console.error("⚠️ ALERTA: Datos faltantes en item:", r);

      await conn.query(
        "INSERT INTO order_items (order_id, product_id, name, price, qty, subtotal) VALUES (?, ?, ?, ?, ?, ?)", 
        [orderId, r.id, r.name, r.price, r.qty, r.subtotal]
      );
      
      await conn.query("UPDATE products SET stock = stock - ? WHERE id = ?", [r.qty, r.id]);
    }

    await conn.commit();
    return res.status(201).json({ msg: "Compra exitosa", orderId, total });

  } catch (err) {
    await conn.rollback();
    return res.status(409).json({ msg: err.message });
  } finally {
    conn.release();
  }
};

module.exports = { checkout };