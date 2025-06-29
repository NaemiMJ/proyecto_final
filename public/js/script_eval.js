// Verificar sesión
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  window.location.href = "./login.html"; // Redirige si no hay sesión
}
const userId = usuario._id;

// =======================
// Mostrar evaluaciones
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  const evalContainer = document.querySelector(".eval");

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/evaluaciones`);
    const evaluaciones = await response.json();

    if (!response.ok) throw new Error("No se pudieron obtener evaluaciones");

    evalContainer.innerHTML = ""; // Limpia antes de pintar
    evaluaciones.forEach(evaluacion => {
  const div = document.createElement("div");
  div.className = "card my-3 p-3 shadow-sm";

  div.innerHTML = `
    <h5>${evaluacion.materia}</h5>
    <p class="mb-1"><strong>Fecha:</strong> ${new Date(evaluacion.fecha_ev).toLocaleDateString()}</p>
    <p><strong>Recordatorio:</strong> ${evaluacion.recordatorio ? "Sí" : "No"}</p>
    <button class="btn btn-danger btn-sm mt-2 eliminar-btn" data-id="${evaluacion._id}">Eliminar</button>
  `;

  evalContainer.appendChild(div);
});
evalContainer.addEventListener("click", async (e) => {
  if (e.target.classList.contains("eliminar-btn")) {
    const id = e.target.getAttribute("data-id");

    if (confirm("¿Estás seguro de que deseas eliminar esta evaluación?")) {
      try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/evaluaciones/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) throw new Error("No se pudo eliminar");

        // Recargar la página o eliminar el nodo
        location.reload(); // o puedes usar e.target.parentElement.remove();
      } catch (error) {
        alert("Error al eliminar evaluación");
        console.error(error);
      }
    }
  }
});

  } catch (error) {
    console.error("Error al cargar evaluaciones:", error);
    evalContainer.innerHTML = `<p class="text-danger">No se pudieron cargar las evaluaciones.</p>`;
  }
});

// =======================
// Agregar evaluación
// =======================
document.getElementById("formNuevaEval").addEventListener("submit", async (e) => {
  e.preventDefault();

  const materia = document.getElementById("titulo").value.trim();
  const fecha_ev = document.getElementById("fechaLimite").value;
  const recordatorio = document.getElementById("recordatorio").checked;

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/evaluaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ materia, fecha_ev, recordatorio })
    });

    if (!response.ok) throw new Error("No se pudo guardar la evaluación");

    // Recargar la lista
    document.getElementById("formNuevaEval").reset();
    bootstrap.Modal.getInstance(document.getElementById("agregarEvalModal")).hide();
    location.reload();

  } catch (error) {
    alert("Error al guardar evaluación");
    console.error(error);
  }
});

// =======================
// Logout
// =======================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "./login.html";
});
