
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const identificador = document.getElementById("identificador").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ identificador, password })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("usuario", JSON.stringify(data.usuario)); // 🔐 Guarda usuario
        window.location.href = "../html/taimo.html"; // Redirige a la página principal
      }else {
        alert(`Error: ${data.mensaje}`);
      }
    } catch (error) {
      alert("Error al iniciar sesión.");
      console.error(error);
    }
  });
});