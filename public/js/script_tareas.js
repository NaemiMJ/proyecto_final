// =======================
// Función para capitalizar la primera letra
// =======================
function capitalizar(texto) {
  if (!texto) return "";
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
}

// =======================
// Autenticación del usuario
// =======================
const usuario = JSON.parse(localStorage.getItem("usuario"));
if (!usuario) {
  window.location.href = "./login.html";
}
const userId = usuario._id;

document.addEventListener("DOMContentLoaded", () => {
  const nombreElemento = document.getElementById("nombreUsuario");
  if (nombreElemento && usuario?.nombre) {
    nombreElemento.textContent = capitalizar(usuario.nombre);
  }
});

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
    console.error("❌ Error al cargar tareas:", error);
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

  let html = `
    <div class="d-flex align-items-center justify-content-between flex-wrap mb-1">
      <div class="d-flex align-items-center gap-3 flex-wrap">
        <h5 class="mb-0">${tarea.titulo}</h5>
        <span class="badge-prioridad ${tarea.prioridad.toLowerCase()}">
          Prioridad: ${capitalizar(tarea.prioridad)}
        </span>
      </div>
     <div class="form-check m-0 d-flex align-items-center gap-5">
      <label class="form-check-label mb-0 " for="finalizada-${tarea._id}">Finalizado</label>
      <input id="finalizada-${tarea._id}" class="form-check-input finalizada-checkbox" type="checkbox" data-id="${tarea._id}" ${tarea.finalizada ? "checked" : ""}>
    </div>
    </div>

    <p class="mb-2"><strong>Fecha límite:</strong> ${new Date(tarea.fecha_limite).toLocaleDateString()}</p>
`;

    if (tarea.descripcion?.trim()) {
      html += `<p><strong>Descripción:</strong> ${tarea.descripcion}</p>`;
    }

    // Subtareas
    if (tarea.subtareas?.length > 0) {
      const listaSub = tarea.subtareas.map((s, index) => `
        <li>
          <input type="checkbox" class="form-check-input me-2 subtarea-checkbox" 
                 data-id="${tarea._id}" data-index="${index}" ${s.finalizada_sub ? 'checked' : ''}>
          ${s.nombre_sub}
        </li>`).join("");
        
      html += `<div><strong>Subtareas:</strong><ul class="list-unstyled">${listaSub}</ul></div>`;
    }

    html += `
      <div class="text-end mt-2">
        <button class="btn btn-sm btn-danger eliminar-tarea" data-id="${tarea._id}">
          🗑 Eliminar
        </button>
      </div>
    `;

    card.innerHTML = html;
    contenedor.appendChild(card);
  });

  // Evento para eliminar tarea
  document.querySelectorAll('.eliminar-tarea').forEach(btn => {
    btn.addEventListener('click', async () => {
      const tareaId = btn.getAttribute('data-id');
      if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
        try {
          const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas/${tareaId}`, {
            method: 'DELETE'
          });

          if (!response.ok) throw new Error('Error al eliminar tarea');
          location.reload();
        } catch (error) {
          console.error('❌ Error al eliminar tarea:', error);
          alert('No se pudo eliminar la tarea.');
        }
      }
    });
  });

  // Evento para marcar tarea como finalizada
  document.querySelectorAll('.finalizada-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const tareaId = checkbox.getAttribute('data-id');
      const nuevaFinalizada = checkbox.checked;

      try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas/${tareaId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ finalizada: nuevaFinalizada })
        });

        if (!response.ok) throw new Error("Error al actualizar tarea");
      } catch (error) {
        alert("No se pudo actualizar la tarea.");
        checkbox.checked = !nuevaFinalizada;
      }
    });
  });

  // Evento para marcar subtareas
  document.querySelectorAll('.subtarea-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', async () => {
      const tareaId = checkbox.getAttribute('data-id');
      const index = checkbox.getAttribute('data-index');
      const nuevaFinalizada = checkbox.checked;

      try {
        const response = await fetch(`http://localhost:3000/usuarios/${userId}/tareas/${tareaId}/subtareas/${index}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
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
// Ordenar
// =======================
function ordenarPorPrioridad(tareas) {
  const prioridadValor = { alta: 1, media: 2, baja: 3 };
  return [...tareas].sort((a, b) => prioridadValor[a.prioridad] - prioridadValor[b.prioridad]);
}

function ordenarPorFecha(tareas) {
  return [...tareas].sort((a, b) => new Date(a.fecha_limite) - new Date(b.fecha_limite));
}

document.getElementById("ordenPrioridad").addEventListener("click", () => {
  const tareasOrdenadas = ordenarPorPrioridad(tareasOriginales);
  mostrarTareas(tareasOrdenadas);
});

document.getElementById("ordenFecha").addEventListener("click", () => {
  const tareasOrdenadas = ordenarPorFecha(tareasOriginales);
  mostrarTareas(tareasOrdenadas);
});

// =======================
// Logout
// =======================
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("usuario");
  window.location.href = "../../index.html";
});
