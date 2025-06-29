
// script_eval.js
document.addEventListener('DOMContentLoaded', async () => {
  const usuarioId = localStorage.getItem('usuarioId');
  if (!usuarioId) {
    window.location.href = 'login.html';
    return;
  }
  
  // Cargar evaluaciones
  try {
    const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}/evaluaciones`);
    if (!response.ok) throw new Error('Error al cargar evaluaciones');
    
    const evaluaciones = await response.json();
    renderEvaluaciones(evaluaciones);
  } catch (error) {
    console.error('Error:', error);
  }
  
  // Formulario para agregar evaluación
  document.getElementById('formNuevaEval').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nuevaEval = {
      materia: document.getElementById('titulo').value,
      fecha_ev: document.getElementById('fechaLimite').value,
      recordatorio: false
    };
    
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${usuarioId}/evaluaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaEval)
      });
      
      if (!response.ok) throw new Error('Error al guardar evaluación');
      
      // Recargar evaluaciones
      location.reload();
    } catch (error) {
      console.error('Error:', error);
    }
  });
});

function renderEvaluaciones(evaluaciones) {
  const contenedor = document.querySelector('.eval');
  contenedor.innerHTML = '';
  
  evaluaciones.forEach(eval => {
    const evalElement = document.createElement('div');
    evalElement.className = 'card mb-3';
    evalElement.innerHTML = `
      <div class="card-body">
        <h5 class="card-title">${eval.materia}</h5>
        <p class="card-text"><small class="text-muted">Fecha: ${new Date(eval.fecha_ev).toLocaleDateString()}</small></p>
        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="recordatorio-${eval._id}" ${eval.recordatorio ? 'checked' : ''}>
          <label class="form-check-label" for="recordatorio-${eval._id}">Recordatorio</label>
        </div>
      </div>
    `;
    contenedor.appendChild(evalElement);
  });
}