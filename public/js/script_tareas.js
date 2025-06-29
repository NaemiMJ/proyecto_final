
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  window.location.href = "./login.html";
}
const userId = usuario._id;

let tareasOriginales = []; 

// =======================
// Cargar tareas al iniciar
// =======================
document.addEventListener("DOMContentLoaded", async () => {
  const tareaContainer = document.querySelector(".tarea");

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas`);
    const tareas = await response.json();

    if (!response.ok) throw new Error("Error al obtener tareas");

    tareasOriginales = tareas; 

    mostrarTareas(tareasOriginales);

  } catch (error) {
    console.error("Error al cargar tareas:", error);
    tareaContainer.innerHTML = `<p class="text-danger">No se pudieron cargar las tareas.</p>`;
  }
});

// =======================
// Mostrar tareas dinámicamente
// =======================
function mostrarTareas(lista) {
  const contenedor = document.querySelector(".tarea");
  contenedor.innerHTML = "";

  lista.forEach(tarea => {
    const card = document.createElement("div");
    card.className = "card my-3 p-3 shadow-sm";

    let html = `<h5>${tarea.titulo}</h5>`;

    if (tarea.descripcion?.trim()) {
      html += `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>`;
    }

    html += `
      <p><strong>Prioridad:</strong> ${tarea.prioridad}</p>
      <p><strong>Fecha límite:</strong> ${new Date(tarea.fecha_limite).toLocaleDateString()}</p>
      <p><strong>Finalizada:</strong> ${tarea.finalizada ? "Sí" : "No"}</p>
    `;

    if (tarea.subtareas?.length > 0) {
      const listaSub = tarea.subtareas.map(s => `<li>${s.nombre_sub} ${s.finalizada_sub ? '✅' : ''}</li>`).join("");
      html += `<div><strong>Subtareas:</strong><ul>${listaSub}</ul></div>`;
    }

    card.innerHTML = html;
    contenedor.appendChild(card);
  });
}

// =======================
// Agregar nueva tarea
// =======================
document.getElementById("formNuevaTarea").addEventListener("submit", async (e) => {
  e.preventDefault();

  const titulo = document.getElementById("titulo").value.trim();
  const descripcion = document.getElementById("descripcion").value.trim();
  const prioridad = document.getElementById("prioridad").value;
  const fecha_limite = document.getElementById("fechaLimite").value;
  const subtareasStr = document.getElementById("subtareas").value;

  const subtareas = subtareasStr
    .split(",")
    .map(s => s.trim())
    .filter(s => s !== "")
    .map(nombre => ({ nombre_sub: nombre, finalizada_sub: false }));

  const nuevaTarea = {
    titulo,
    descripcion,
    prioridad,
    fecha_limite,
    subtareas,
    finalizada: false
  };

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevaTarea)
    });

    if (!response.ok) throw new Error("No se pudo guardar la tarea");

    document.getElementById("formNuevaTarea").reset();
    bootstrap.Modal.getInstance(document.getElementById("agregarTareaModal")).hide();
    location.reload(); 

  } catch (error) {
    alert("Error al guardar la tarea");
    console.error(error);
  }
});

// =======================
// Ordenar por prioridad
// =======================
function ordenarPorPrioridad(tareas) {
  const prioridadValor = { alta: 1, media: 2, baja: 3 };
  return [...tareas].sort((a, b) => prioridadValor[a.prioridad] - prioridadValor[b.prioridad]);
}

// =======================
// Ordenar por fecha límite
// =======================
function ordenarPorFecha(tareas) {
  return [...tareas].sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
}


document.getElementById("ordenPrioridad").addEventListener("click", () => {
  const ordenadas = ordenarPorPrioridad(tareasOriginales);
  mostrarTareas(ordenadas);
});

document.getElementById("ordenFecha").addEventListener("click", () => {
  const ordenadas = ordenarPorFecha(tareasOriginales);
  mostrarTareas(ordenadas);
});


document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "./login.html";
});
