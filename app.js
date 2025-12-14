//app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
//Importar rate limit
const rateLimit = require("express-rate-limit");

const app = express();
const PORT = process.env.PORT || 4000;

//Middlewares
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

//Configurar Limitador (max 100 peticiones por 15 min por IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100, 
  message: { msg: "Demasiadas peticiones, intenta más tarde." }
});
app.use(limiter);

app.use(express.static(path.join(__dirname, "public")));

//Rutas
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/products", require("./routes/products"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orders"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ msg: "Error interno del servidor", error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor PRO corriendo en http://localhost:${PORT}`);
});