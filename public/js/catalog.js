//public/js/catalog.js

let cart = [];

document.addEventListener("DOMContentLoaded", () => {
  loadProducts();

  const btnClear = document.getElementById("btnClearCart");
  const btnCheckout = document.getElementById("btnCheckout");
  const btnPayConfirm = document.getElementById("btnPayConfirm");
  const btnCreate = document.getElementById("btnCreateProduct");
  const btnMyOrders = document.getElementById("btnMyOrders"); // Nuevo

  if (btnClear) btnClear.addEventListener("click", clearCart);
  if (btnCreate) btnCreate.addEventListener("click", createProductReal);
  
  //Listener para pedidos
  if (btnMyOrders) {
    btnMyOrders.addEventListener("click", (e) => {
      e.preventDefault();
      openOrdersModal();
    });
  }

  if (btnCheckout) {
    btnCheckout.addEventListener("click", () => {
      if (cart.length === 0) return alert("Carrito vacío");
      if (typeof getToken === "function" && !getToken()) {
        window.location.href = "/auth/login.html";
        return;
      }
      if (window.bootstrap) new bootstrap.Modal(document.getElementById("payModal")).show();
    });
  }
  if (btnPayConfirm) btnPayConfirm.addEventListener("click", () => checkoutReal("APPROVED"));
});

//carga de productos con validaciones y admin
async function loadProducts() {
  const container = document.getElementById("productsGrid");
  if (!container) return;
  container.innerHTML = "<p class='text-white text-center'>Cargando...</p>";

  try {
    const res = await fetch("/api/products");
    const products = await res.json();
    container.innerHTML = "";

    if (products.length === 0) {
      container.innerHTML = "<p class='text-white text-center'>No hay productos.</p>";
      return;
    }

    const isAdmin = (typeof getRole === "function" && getRole() === "admin");

    products.forEach(p => {
      const col = document.createElement("div");
      col.className = "col-md-6 col-lg-4";
      
      //Validación Visual de Stock
      const isOutOfStock = p.stock <= 0;
      const btnClass = isOutOfStock ? "btn-secondary btn-disabled" : "btn-outline-light btn-add";
      const btnText = isOutOfStock ? "Agotado" : "Agregar +";
      const stockColor = isOutOfStock ? "text-danger" : "text-secondary";

      //Botones de Admin(Editar y Borrar)
      let adminControls = "";
      if (isAdmin) {
        adminControls = `
          <div class="mt-2 border-top pt-2 d-flex justify-content-end gap-2">
            <button class="btn btn-sm btn-outline-warning btn-edit"><i class="bi bi-pencil"></i> Edit</button>
            <button class="btn btn-sm btn-outline-danger btn-delete"><i class="bi bi-trash"></i></button>
          </div>
        `;
      }

      col.innerHTML = `
        <div class="product-card h-100 p-3 d-flex flex-column text-white">
          <h5 class="fw-bold text-info">${p.name}</h5>
          <div class="mt-auto d-flex justify-content-between align-items-center">
            <span class="fs-5">$${Number(p.price).toFixed(2)}</span>
            <button class="btn btn-sm ${btnClass}" ${isOutOfStock ? 'disabled' : ''}>${btnText}</button>
          </div>
          <small class="${stockColor} mt-2 fw-bold">Stock: ${p.stock}</small>
          ${adminControls}
        </div>
      `;

      //Evento agregar (Solo si hay stock)
      if (!isOutOfStock) {
        col.querySelector(".btn-add").addEventListener("click", () => addToCart(p.id, p.name, p.price));
      }

      //Eventos admin
      if (isAdmin) {
        col.querySelector(".btn-delete").addEventListener("click", () => deleteProductReal(p.id));
        col.querySelector(".btn-edit").addEventListener("click", () => editProductReal(p));
      }

      container.appendChild(col);
    });
  } catch (err) { console.error(err); container.innerHTML = "<p class='text-danger text-center'>Error API.</p>"; }
}

//logica carrito
function addToCart(id, name, price) {
  const existing = cart.find(i => i.id === id);
  existing ? existing.qty++ : cart.push({ id, name, price, qty: 1 });
  updateCartUI();
}
function updateCartUI() {
  const list = document.getElementById("cartList");
  const totalEl = document.getElementById("cartTotal");
  if (!list) return;
  list.innerHTML = "";
  let total = 0;
  cart.forEach((item, idx) => {
    total += item.price * item.qty;
    const li = document.createElement("li");
    li.className = "list-group-item d-flex justify-content-between bg-transparent text-white border-secondary";
    li.innerHTML = `<div>${item.name} <small>x${item.qty}</small></div><button class="btn btn-sm btn-danger py-0 btn-rm">×</button>`;
    li.querySelector(".btn-rm").addEventListener("click", () => { cart.splice(idx, 1); updateCartUI(); });
    list.appendChild(li);
  });
  totalEl.textContent = `$${total.toFixed(2)}`;
}
function clearCart() { cart = []; updateCartUI(); }

//checkout
async function checkoutReal(status) {
  const token = typeof getToken === "function" ? getToken() : null;
  if (!token) return alert("Login requerido");
  
  try {
    const res = await fetch("/api/cart/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ items: cart.map(i => ({ product_id: i.id, qty: i.qty })), payment: { status, last4: "4242" } })
    });
    const data = await res.json();
    if (!res.ok) return alert(data.msg);
    
    if (window.bootstrap) bootstrap.Modal.getInstance(document.getElementById("payModal")).hide();
    alert(`Orden #${data.orderId} creada!`);
    clearCart();
    loadProducts();
  } catch (e) { alert("Error de red"); }
}

//historial de pedidos
async function openOrdersModal() {
  const token = getToken();
  if (!token) return alert("Debes iniciar sesión.");
  
  if (window.bootstrap) new bootstrap.Modal(document.getElementById("ordersModal")).show();
  const content = document.getElementById("ordersContent");
  content.innerHTML = "Cargando...";

  try {
    const res = await fetch("/api/orders", { headers: { Authorization: "Bearer " + token } });
    const data = await res.json();
    
    if (!data.orders || data.orders.length === 0) {
      content.innerHTML = "<p>No has realizado compras aún.</p>";
      return;
    }

    let html = `<table class="table table-striped"><thead><tr><th>ID</th><th>Fecha</th><th>Total</th><th>Estado</th></tr></thead><tbody>`;
    data.orders.forEach(o => {
      const date = new Date(o.created_at).toLocaleDateString();
      html += `<tr><td>#${o.id}</td><td>${date}</td><td>$${o.total}</td><td><span class="badge bg-success">${o.status}</span></td></tr>`;
    });
    html += "</tbody></table>";
    content.innerHTML = html;
  } catch (e) { content.innerHTML = "Error al cargar pedidos."; }
}

//funciones de admin
async function createProductReal() {
  const name = document.getElementById("prodName").value;
  const price = document.getElementById("prodPrice").value;
  const stock = document.getElementById("prodStock").value;
  const token = getToken();
  if (!name || !price || !stock) return alert("Faltan datos");

  await fetchAPI("/api/products", "POST", { name, price, stock }, token);
  document.getElementById("prodName").value = "";
  document.getElementById("prodPrice").value = "";
  document.getElementById("prodStock").value = "";
  loadProducts();
}

async function deleteProductReal(id) {
  if (!confirm("¿Seguro que quieres eliminar este producto?")) return;
  await fetchAPI(`/api/products/${id}`, "DELETE", {}, getToken());
  loadProducts();
}

async function editProductReal(p) {
  //Usamos promtps sencillos para editar rápido
  const newName = prompt("Nuevo nombre:", p.name);
  if (newName === null) return;
  const newPrice = prompt("Nuevo precio:", p.price);
  if (newPrice === null) return;
  const newStock = prompt("Nuevo stock:", p.stock);
  if (newStock === null) return;

  await fetchAPI(`/api/products/${p.id}`, "PUT", { 
    name: newName, 
    price: newPrice, 
    stock: newStock 
  }, getToken());
  loadProducts();
}

//Helper para fetch
async function fetchAPI(url, method, body, token) {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify(body)
    });
    const data = await res.json();
    if (res.ok) alert(data.msg || "Éxito");
    else alert(data.msg || "Error");
  } catch (e) { alert("Error de red"); }
}