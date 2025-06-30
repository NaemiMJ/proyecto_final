

let duration = 25 * 60; // 25 minutos en segundos
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
    startPauseBtn.classList.remove('btn-success');
    startPauseBtn.classList.add('btn-warning');
    running = true;
  } else {
    clearInterval(timer);
    startPauseBtn.textContent = '▶️';
    startPauseBtn.classList.remove('btn-warning');
    startPauseBtn.classList.add('btn-success');
    running = false;
  }
}

function resetTimer() {
  clearInterval(timer);
  remaining = duration;
  updateClock();
  startPauseBtn.textContent = '▶️';
  startPauseBtn.classList.remove('btn-warning');
  startPauseBtn.classList.add('btn-success');
  running = false;
}

startPauseBtn.addEventListener('click', startTimer);
resetBtn.addEventListener('click', resetTimer);

// Inicializar el reloj
updateClock();

//inicio del script para mostrar klos datos

const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  window.location.href = "./login.html";
}
const userId = usuario._id;

let tareasOriginales = [];
let evaluacionesOriginales = [];

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`http://localhost:3000/usuarios/${userId}`);
    if (!res.ok) throw new Error("No se pudo obtener el usuario");

    const datos = await res.json();
    tareasOriginales = datos.tareas || [];
    evaluacionesOriginales = datos.evaluaciones || [];

    mostrarTareas(tareasOriginales);
    mostrarEvaluaciones(evaluacionesOriginales);

    // Ordenar tareas desde dropdown
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

function mostrarEvaluaciones(lista) {
  const contenedor = document.querySelector(".evaluaciones ul");
  contenedor.innerHTML = "";

  const ordenadas = [...lista].sort((a, b) => new Date(a.fecha_ev) - new Date(b.fecha_ev));

  ordenadas.forEach(ev => {
    contenedor.innerHTML += `<li><strong>${ev.materia}</strong> - ${new Date(ev.fecha_ev).toLocaleDateString()}</li>`;
  });
}

function ordenarPorPrioridad() {
  const prioridadValor = { alta: 1, media: 2, baja: 3 };
  const ordenadas = [...tareasOriginales].sort(
    (a, b) => (prioridadValor[a.prioridad.toLowerCase()] || 4) - (prioridadValor[b.prioridad.toLowerCase()] || 4)
  );
  mostrarTareas(ordenadas);
}

function ordenarPorFecha() {
  const ordenadas = [...tareasOriginales].sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
  mostrarTareas(ordenadas);
}

