// auth.js - login y registro con roles

document.addEventListener("DOMContentLoaded", () => {
  const btnRegister = document.getElementById("btnRegister");
  const btnLogin = document.getElementById("btnLogin");
  const btnLogout = document.getElementById("btnLogout");

  // limpiar campos siempre que entras a estas páginas
  const regEmail = document.getElementById("regEmail");
  const regPassword = document.getElementById("regPassword");
  if (regEmail) regEmail.value = "";
  if (regPassword) regPassword.value = "";

  const loginEmail = document.getElementById("loginEmail");
  const loginPassword = document.getElementById("loginPassword");
  if (loginEmail) loginEmail.value = "";
  if (loginPassword) loginPassword.value = "";

  if (btnRegister) btnRegister.addEventListener("click", registerUser);
  if (btnLogin) btnLogin.addEventListener("click", loginUser);
  if (btnLogout) {
    btnLogout.addEventListener("click", () => {
      clearSession();
      updateUserStatus();
      if (loginEmail) loginEmail.value = "";
      if (loginPassword) loginPassword.value = "";
      const msgEl = document.getElementById("loginMsg");
      if (msgEl) msgEl.textContent = "Sesión cerrada.";
      showMainMsg("Sesión cerrada correctamente.", "info");
    });
  }
});

async function registerUser() {
  clearMainMsg();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value.trim();
  const msgEl = document.getElementById("regMsg");

  if (!email || !password) {
    msgEl.textContent = "Llena email y password.";
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      msgEl.textContent = data.msg || "Error en registro.";
      showMainMsg(data.msg || "Error en registro.", "danger");
    } else {
      msgEl.textContent = data.msg || "Usuario registrado.";
      showMainMsg("Usuario registrado correctamente.", "success");
      document.getElementById("regEmail").value = "";
      document.getElementById("regPassword").value = "";
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Error de red.";
    showMainMsg("Error de red en registro.", "danger");
  }
}

async function loginUser() {
  clearMainMsg();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msgEl = document.getElementById("loginMsg");

  if (!email || !password) {
    msgEl.textContent = "Llena email y password.";
    return;
  }

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok || !data.token) {
      clearSession();
      updateUserStatus();
      msgEl.textContent = data.msg || "Error en login.";
      showMainMsg(data.msg || "Error en login.", "danger");
    } else {
      // guardamos token y rol en localStorage
      setSession(data.token, email, data.role);
      updateUserStatus();
      msgEl.textContent = "Login exitoso.";
      showMainMsg("Login exitoso. Redirigiendo al catálogo...", "success");

      //limpiar campos al iniciar sesión
      document.getElementById("loginEmail").value = "";
      document.getElementById("loginPassword").value = "";

      //flujo tipo ecommerce: después de login te lleva al catálogo
      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    }
  } catch (err) {
    console.error(err);
    msgEl.textContent = "Error de red en login.";
    showMainMsg("Error de red en login.", "danger");
  }
}
