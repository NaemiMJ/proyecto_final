// script_tareas.js
document.addEventListener('DOMContentLoaded', async () => {
  // Obtener el ID del usuario de la sesión (deberías implementar un sistema de autenticación)
  const usuarioId = localStorage.getItem('usuarioId');
  
  if (!usuarioId) {
    window.location.href = 'login.html';
    return;
  }
  
  // Cargar tareas
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}/tareas`);
    if (!response.ok) throw new Error('Error al cargar tareas');
    
    const tareas = await response.json();
    renderTareas(tareas);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Formulario para agregar tarea
  document.getElementById('formNuevaTarea').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevaTarea = {
      titulo: document.getElementById('titulo').value,
      fecha_limite: document.getElementById('fechaLimite').value,
      prioridad: document.getElementById('prioridad').value,
      descripcion: document.getElementById('descripcion').value,
      subtareas: document.getElementById('subtareas').value.split(',').map(sub => ({
        nombre_sub: sub.trim(),
        finalizada_sub: false
      })),
      finalizada: false
    };
    
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}/tareas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaTarea)
      });
      
      if (!response.ok) throw new Error('Error al guardar tarea');
      
      // Recargar tareas
      location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

function renderTareas(tareas) {
  const contenedor = document.querySelector('.tarea');
  contenedor.innerHTML = '';
  
  tareas.forEach(tarea => {
    const tareaElement = document.createElement('div');
    tareaElement.className = 'card mb-3';
    tareaElement.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${tarea.titulo}</h5>
        <p class="card-text">${tarea.descripcion || 'Sin descripción'}</p>
        <p class="card-text"><small class="text-muted">Fecha límite: ${new Date(tarea.fecha_limite).toLocaleDateString()}</small></p>
        <p class="card-text">Prioridad: <span class="badge ${getPriorityBadgeClass(tarea.prioridad)}">${tarea.prioridad}</span></p>
        ${tarea.subtareas?.length ? `
          <ul>
            ${tarea.subtareas.map(sub => `<li>${sub.nombre_sub} - ${sub.finalizada_sub ? '✅' : '❌'}</li>`).join('')}
          </ul>
        ` : ''}
      </div>
    `;
    contenedor.appendChild(tareaElement);
  });
}

function getPriorityBadgeClass(priority) {
  switch (priority) {
    case 'alta': return 'bg-danger';
    case 'media': return 'bg-warning text-dark';
    case 'baja': return 'bg-success';
    default: return 'bg-secondary';
  }
}