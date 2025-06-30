// =======================
// Función para capitalizar
// =======================
function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// =======================
// Pomodoro Timer
// =======================
let duration = 25 * 60;
let remaining = duration;
let timer = null;
let running = false;

const clock = document.getElementById('clock');
const startPauseBtn = document.getElementById('startPauseBtn');
const resetBtn = document.getElementById('resetBtn');

function updateClock() {
  const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
  const secs = String(remaining % 60).padStart(2, '0');
  clock.textContent = `${mins}:${secs}`;
}

function startTimer() {
  if (!running) {
    timer = setInterval(() => {
      if (remaining > 0) {
        remaining--;
        updateClock();
      } else {
        clearInterval(timer);
        alert("¡Pomodoro terminado! 🕒🍅");
      }
    }, 1000);
    startPauseBtn.textContent = '⏸️';
    startPauseBtn.classList.replace('btn-success', 'btn-warning');
    running = true;
  } else {
    clearInterval(timer);
    startPauseBtn.textContent = '▶️';
    startPauseBtn.classList.replace('btn-warning', 'btn-success');
    running = false;
  }
}

function resetTimer() {
  clearInterval(timer);
  remaining = duration;
  updateClock();
  startPauseBtn.textContent = '▶️';
  startPauseBtn.classList.replace('btn-warning', 'btn-success');
  running = false;
}

startPauseBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);
updateClock();

// =======================
// Inicio: obtener datos
// =======================
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) window.location.href = "./login.html";
const userId = usuario._id;

document.addEventListener("DOMContentLoaded", () => {
  const nombreElemento = document.getElementById("nombreUsuario");
  if (nombreElemento && usuario?.nombre) {
    nombreElemento.textContent = capitalizar(usuario.nombre);
  }
});

let tareasOriginales = [];
let evaluacionesOriginales = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`http://localhost:3000/usuarios/${userId}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const datos = await res.json();
    tareasOriginales = datos.tareas || [];
    evaluacionesOriginales = datos.evaluaciones || [];

    // Mostrar solo las primeras 3
    mostrarTareas(tareasOriginales.slice(0, 3));
    mostrarEvaluaciones(evaluacionesOriginales.slice(0, 3));

    // Dropdown ordenar
    document.querySelectorAll(".dropdown-menu .dropdown-item").forEach(item => {
      item.addEventListener("click", (e) => {
        const texto = e.target.textContent.toLowerCase();
        if (texto.includes("prioridad")) {
          ordenarPorPrioridad();
        } else if (texto.includes("fecha")) {
          ordenarPorFecha();
        }
      });
    });

  } catch (err) {
    console.error("❌ Error al cargar datos:", err);
    document.querySelector(".tarea").innerHTML = "<p class='text-danger'>No se pudieron cargar las tareas.</p>";
    document.querySelector(".evaluaciones ul").innerHTML = "<li class='text-danger'>No se pudieron cargar las evaluaciones.</li>";
  }
});

// =======================
// Mostrar tareas
// =======================
function mostrarTareas(lista) {
  const contenedor = document.querySelector(".tarea");
  contenedor.innerHTML = "";

  lista.forEach(tarea => {
    const card = document.createElement("div");
    card.className = "card my-3 p-3 shadow-sm";

    let html = `
      <div class="d-flex align-items-center justify-content-between flex-wrap mb-1">
        <div class="d-flex align-items-center gap-3 flex-wrap">
          <h5 class="mb-0">${tarea.titulo}</h5>
          <span class="badge-prioridad ${tarea.prioridad.toLowerCase()}">
            Prioridad: ${capitalizar(tarea.prioridad)}
          </span>
        </div>
        <div class="form-check m-0 d-flex align-items-center gap-5">
          <label class="form-check-label mb-0" for="finalizada-${tarea._id}">Finalizado</label>
          <input id="finalizada-${tarea._id}" class="form-check-input finalizada-checkbox" type="checkbox" data-id="${tarea._id}" ${tarea.finalizada ? "checked" : ""}>
        </div>
      </div>
      <p class="mb-2"><strong>Fecha límite:</strong> ${new Date(tarea.fecha_limite).toLocaleDateString()}</p>
    `;

    if (tarea.descripcion?.trim()) {
      html += `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>`;
    }

    if (tarea.subtareas?.length > 0) {
      const listaSub = tarea.subtareas.map((s, index) => `
        <li class="d-flex align-items-center gap-2 mb-1">
          <input type="checkbox" class="form-check-input subtarea-checkbox" 
                 data-id="${tarea._id}" data-index="${index}" ${s.finalizada_sub ? 'checked' : ''}>
          <span>${s.nombre_sub}</span>
        </li>
      `).join("");
      html += `<div><strong>Subtareas:</strong><ul class="list-unstyled">${listaSub}</ul></div>`;
    }

    card.innerHTML = html;
    contenedor.appendChild(card);
  });

  // Marcar tarea como finalizada
  document.querySelectorAll('.finalizada-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const tareaId = checkbox.getAttribute('data-id');
      const nuevaFinalizada = checkbox.checked;

      try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas/${tareaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalizada: nuevaFinalizada })
        });
        if (!response.ok) throw new Error("Error al actualizar tarea");
      } catch (error) {
        alert("No se pudo actualizar la tarea.");
        checkbox.checked = !nuevaFinalizada;
      }
    });
  });

  // Marcar subtareas
  document.querySelectorAll('.subtarea-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const tareaId = checkbox.getAttribute('data-id');
      const index = checkbox.getAttribute('data-index');
      const nuevaFinalizada = checkbox.checked;

      try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas/${tareaId}/subtareas/${index}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ finalizada_sub: nuevaFinalizada })
        });
        if (!response.ok) throw new Error("Error al actualizar subtarea");
      } catch (error) {
        alert("No se pudo actualizar la subtarea.");
        checkbox.checked = !nuevaFinalizada;
      }
    });
  });
}

// =======================
// Mostrar evaluaciones (máximo 3)
// =======================
function mostrarEvaluaciones(lista) {
  const contenedor = document.querySelector(".evaluaciones ul");
  contenedor.innerHTML = "";

  const ordenadas = [...lista].sort((a, b) => new Date(a.fecha_ev) - new Date(b.fecha_ev)).slice(0, 3);

  ordenadas.forEach(ev => {
    contenedor.innerHTML += `<li><strong>${ev.materia}</strong> - ${new Date(ev.fecha_ev).toLocaleDateString()}</li>`;
  });
}

// =======================
// Ordenar
// =======================
function ordenarPorPrioridad() {
  const prioridadValor = { alta: 1, media: 2, baja: 3 };
  const ordenadas = [...tareasOriginales].sort(
    (a, b) => (prioridadValor[a.prioridad.toLowerCase()] || 4) - (prioridadValor[b.prioridad.toLowerCase()] || 4)
  );
  mostrarTareas(ordenadas.slice(0, 3));
}

function ordenarPorFecha() {
  const ordenadas = [...tareasOriginales].sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  mostrarTareas(ordenadas.slice(0, 3));
}

// =======================
// Logout
// =======================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "../../index.html";
});
