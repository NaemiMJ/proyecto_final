document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
    return;
  }

  const nuevoUsuario = {
    nom_usuario: document.getElementById('username').value,
    nombre: document.getElementById('nombre').value, // contiene nombre y apellido juntos
    contrasena: password,
    correo: document.getElementById('correo').value,
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

    alert('Registro exitoso! Por favor inicia sesión');
    window.location.href = 'login.html';
  } catch (error) {
    alert(error.message);
  }
});
