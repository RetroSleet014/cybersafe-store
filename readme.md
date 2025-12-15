# CyberSafe Store - Secure E-Commerce MVP

Un sistema de comercio electrónico Full-Stack diseñado para demostrar la implementación de **estándares de seguridad web**, gestión de roles (RBAC) y arquitectura escalable mediante contenedores.

> **Nota:** Este proyecto prioriza la lógica de seguridad en el backend, la integridad de datos y la protección contra vulnerabilidades comunes sobre el diseño de interfaz (UI).

## Tecnologías Clave

* **Backend:** Node.js, Express.
* **Base de Datos:** MySQL (Relacional / Transaccional).
* **Seguridad:** JWT (Auth), Bcrypt (Hashing), Rate Limiting (DDoS protection).
* **Infraestructura:** Docker & Docker Compose.
* **Frontend:** Bootstrap 5, Vanilla JS (Cliente ligero para consumir la API).

## Implementaciones de Seguridad

Este proyecto mitiga las siguientes vulnerabilidades OWASP:

1.  **Broken Access Control:**
    * Implementación de Middleware `isAdmin` para proteger rutas sensibles (CRUD de productos).
    * Validación de JWT en cada petición protegida.
2.  **Sensitive Data Exposure:**
    * Las contraseñas se almacenan hasheadas con `bcrypt`.
    * Las variables de entorno no se exponen en el repositorio.
3.  **Brute Force & DDoS:**
    * Implementación de `express-rate-limit` para bloquear IPs tras múltiples peticiones fallidas.
4.  **Injection Attacks:**
    * Uso de consultas parametrizadas (`?`) en MySQL para prevenir SQL Injection.

## Base de Datos

El esquema de la base de datos se encuentra en el archivo [`schema.sql`](./schema.sql).

Este script se ejecuta automáticamente al iniciar el contenedor de Docker, creando:
* Tablas relacionales optimizadas (Users, Products, Orders).
* Datos semilla (Seeding) para pruebas rápidas.
* Definición estricta de tipos de datos y llaves foráneas.

## Instalación y Despliegue

Este proyecto está contenerizado para un despliegue inmediato.

### Prerrequisitos
* Docker Desktop instalado.
* Node.js v18+.

### Pasos
1.  Clonar el repositorio:
    ```bash
    git clone [https://github.com/andrs1234/cybersafe-store.git](https://github.com/andrs1234/cybersafe-store.git)
    ```
2.  Instalar dependencias:
    ```bash
    npm install
    ```
3.  Configurar variables de entorno:
    * Renombrar el archivo `.env.example` a `.env`.
4.  Configurar el docker-compose.yml:
    Dentro de este archivo veras las variable de entorno del contenedor,con el que se creara el contenedor

     environment:
      # Credenciales de administrador (Root)
      MYSQL_ROOT_PASSWORD: Root123!
      
      # Nombre de la Base de Datos (si lo cambias, debe coincidir con el schema.sql)
      MYSQL_DATABASE: seguridad_web
      
      # Usuario secundario si no quieres usar root en la app
      MYSQL_USER: user_app
      MYSQL_PASSWORD: user_pass
      
6.  Iniciar la base de datos (Docker):
    ```bash
    docker-compose up -d
    ```
7.  Correr el servidor:
    ```bash
    npm start
    ```

---
**Autores:** Andrés Rodríguez Morales y Andres Guzman Cadena
