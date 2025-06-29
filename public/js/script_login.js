// script_login.js
document.querySelector('.login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const credenciales = {
    correo: e.target[0].value,
    contrasena: e.target[1].value
  };
  
  try {
    const response = await fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credenciales)
    });
    
    if (!response.ok) throw new Error('Credenciales incorrectas');
    
    const { usuario } = await response.json();
    
    // Guardar en localStorage y redirigir
    localStorage.setItem('usuarioId', usuario._id);
    window.location.href = 'taimo.html';
  } catch (error) {
    alert(error.message);
  }
});