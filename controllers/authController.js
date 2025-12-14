// controllers/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ msg: "Email y password son obligatorios" });
    }

    //Verificar si existe
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ msg: "El usuario ya existe" });
    }

    //Hash password
    const hashed = await bcrypt.hash(password, 10);
    const role = "user"; //Por defecto todos son user

    await pool.query(
      "INSERT INTO users (email, password, role) VALUES (?, ?, ?)",
      [email, hashed, role]
    );

    return res.json({ msg: "Usuario registrado correctamente" });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ msg: "Email y password son obligatorios" });
    }

    const [rows] = await pool.query("SELECT id, password, role FROM users WHERE email = ?", [email]);
    if (rows.length === 0) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ msg: "Credenciales inválidas" });
    }

    //Generar Token
    const token = jwt.sign(
      { id: user.id, email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({ token, role: user.role });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login };