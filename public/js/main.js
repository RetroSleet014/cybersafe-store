// public/js/main.js

function getToken() {
  return localStorage.getItem("jwtToken");
}

function getRole() {
  return localStorage.getItem("userRole") || null;
}

function getEmail() {
  return localStorage.getItem("userEmail") || "";
}

function setSession(token, email, role) {
  if (token) {
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userEmail", email || "");
    localStorage.setItem("userRole", role || "user");
  }
}

function clearSession() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
}

function updateUserStatus() {
  const el = document.getElementById("userStatus");
  const btnLogoutNav = document.getElementById("btnLogoutNav");
  const adminSection = document.getElementById("adminProductSection"); // <--- NUEVO

  const token = getToken();
  const email = getEmail();
  const role = getRole();

  if (el) {
    if (token && email) {
      const labelRole = role === "admin" ? " (Admin)" : "";
      el.textContent = `Autenticado: ${email}${labelRole}`;
      
      //Si es admin, mostramos el panel
      if (role === "admin" && adminSection) {
        adminSection.classList.remove("d-none");
      } else if (adminSection) {
        adminSection.classList.add("d-none");
      }

    } else {
      el.textContent = "No autenticado";
      if (adminSection) adminSection.classList.add("d-none");
    }
  }

  if (btnLogoutNav) {
    if (token) btnLogoutNav.classList.remove("d-none");
    else btnLogoutNav.classList.add("d-none");

    btnLogoutNav.onclick = () => {
      clearSession();
      updateUserStatus();
      window.location.href = "/auth/login.html";
    };
  }
}

function showMainMsg(text, type = "success") {
  const box = document.getElementById("mainMsg");
  if (!box) return;
  box.textContent = text;
  box.className = "alert alert-" + type;
  box.classList.remove("d-none");
}

function clearMainMsg() {
  const box = document.getElementById("mainMsg");
  if (!box) return;
  box.classList.add("d-none");
  box.textContent = "";
}

document.addEventListener("DOMContentLoaded", () => {
  updateUserStatus();
});