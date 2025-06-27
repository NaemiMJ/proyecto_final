const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Usuario } = require('./models/ModeloUsuario'); // Ajusta la ruta según tu estructura

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Conexión a MongoDB
mongoose.connect('mongodb+srv://NaJoRB:Hola.1234@cluster0.tycxfqj.mongodb.net/proyecto_final?retryWrites=true&w=majority&appName=Cluster0', {
  serverSelectionTimeoutMS: 10000, // Timeout de 10 segundos
  socketTimeoutMS: 45000
})
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch((err) => {
  console.error('❌ Error detallado:', {
    name: err.name,
    message: err.message,
    reason: err.reason?.servers // Muestra info de los servidores
  });
});

// Ruta para crear un nuevo usuario
app.post('/usuarios', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear usuario', error });
  }
});

// Ruta para obtener todos los usuarios
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error });
  }
});

// Puedes agregar más rutas para actualizar o eliminar usuarios

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});