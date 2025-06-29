// script_regist.js
document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  if (document.getElementById('password').value !== document.getElementById('confirmPassword').value) {
    alert('Las contraseñas no coinciden');
    return;
  }
  
  const nuevoUsuario = {
    nom_usuario: e.target[0].value,
    nombre: e.target[1].value,
    apellido: e.target[2].value,
    contrasena: e.target[3].value,
    correo: `${e.target[0].value}@example.com`, // Deberías agregar un campo para el correo
    tareas: [],
    evaluaciones: []
  };
  
  try {
    const response = await fetch('http://localhost:3000/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoUsuario)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.mensaje || 'Error al registrar');
    }
    
    const { usuario } = await response.json();
    alert('Registro exitoso! Por favor inicia sesión');
    window.location.href = 'login.html';
  } catch (error) {
    alert(error.message);
  }
});