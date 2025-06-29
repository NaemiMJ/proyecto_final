
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Usuario } = require('./models/ModeloUsuario'); 

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB con manejo de errores
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://NaJoRB:Hola.1234@cluster0.tycxfqj.mongodb.net/proyecto_final?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

connectDB();

app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'Servicio no disponible - Base de datos desconectada' });
  }
  next();
});

// Ruta para login
app.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const usuario = await Usuario.findOne({ correo, contrasena });
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
    
    res.status(200).json({ mensaje: 'Login exitoso', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el login', error });
  }
});

// Ruta para registro
app.post('/registro', async (req, res) => {
  try {
    const { nom_usuario, correo } = req.body;
    
    // Verificar si el usuario ya existen
    const existeUsuario = await Usuario.findOne({ $or: [{ nom_usuario }, { correo }] });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: 'Usuario o correo ya registrado' });
    }
    
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar usuario', error });
  }
});

// Rutas para tareas
app.post('/usuarios/:id/tareas', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    usuario.tareas.push(req.body);
    await usuario.save();
    res.status(201).json(usuario.tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar tarea', error });
  }
});

// Rutas para evaluaciones
app.post('/usuarios/:id/evaluaciones', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    usuario.evaluaciones.push(req.body);
    await usuario.save();
    res.status(201).json(usuario.evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al agregar evaluación', error });
  }
});

// Obtener tareas de un usuario
app.get('/usuarios/:id/tareas', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    res.status(200).json(usuario.tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tareas', error });
  }
});

// Obtener evaluaciones de un usuario
app.get('/usuarios/:id/evaluaciones', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    res.status(200).json(usuario.evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evaluaciones', error });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});