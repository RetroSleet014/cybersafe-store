-- schema.sql
-- 1. Crear la Base de Datos
CREATE DATABASE IF NOT EXISTS seguridad_web;
USE seguridad_web;

-- 2. Tabla Usuarios
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla Productos

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabla Ordenes (Encabezado)
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'PENDING',
  payment_status VARCHAR(50),
  payment_brand VARCHAR(50),
  payment_last4 VARCHAR(4),
  payment_token VARCHAR(100),
  payment_txn_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5. Tabla Detalle de Ordenes (Items)
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  name VARCHAR(255),
  price DECIMAL(10,2),
  qty INT,
  subtotal DECIMAL(10,2),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- --- DATOS DE PRUEBA ---

-- Insertar Admin por defecto (Password: Admin123!)
-- El hash que genere es de bcrypt para esa contraseña porque como estamos sembrando la base de datos manualmente para que exista un admin desde el día 1
-- tenemos que hacer el trabajo de Node.js nosotros mismos antes
INSERT IGNORE INTO users (email, password, role) 
VALUES ('admin@cybersafe.com', '$2a$12$6TqkpiqcmX.EO1LIGUzWGuPidG3I9qQgDN/lOUVwIJdliuPKwWo3i', 'admin');

-- Insertar productos iniciales para que la tienda no esté vacía
INSERT INTO products (name, price, stock) VALUES 
('Laptop Gamer', 25000.00, 10),
('Mouse RGB', 500.00, 50),
('Teclado Mecánico', 1200.00, 20),
('Monitor 144Hz', 4500.00, 15);