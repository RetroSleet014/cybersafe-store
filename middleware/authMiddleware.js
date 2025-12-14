// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return res.status(401).json({ msg: "Token no proporcionado" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: "Token inválido" });
  }
};

//Middleware para validar rol
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: "Acceso denegado: Se requiere administrador" });
  }
};

module.exports = { auth, isAdmin };
