const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Usuario } = require('./models/ModeloUsuario');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // acepta cualquier origen
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://NaJoRB:Hola.1234@cluster0.tycxfqj.mongodb.net/proyecto_final?retryWrites=true&w=majority&appName=Cluster0', {
      useNewUrlParser: true,
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

// Middleware para verificar conexión activa
app.use((req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ mensaje: 'Servicio no disponible - Base de datos desconectada' });
  }
  next();
});

// ==========================
// Rutas
// ==========================

// Login
app.post('/api/login', async (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({ mensaje: 'Faltan datos de login' });
  }

  try {
    const usuario = await Usuario.findOne({
      $or: [
        { correo: identificador },
        { nom_usuario: identificador }
      ]
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (usuario.contrasena !== password) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.status(200).json({ mensaje: 'Login exitoso', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error });
  }
});


// Registro
app.post('/registro', async (req, res) => {
  try {
    const { nom_usuario, correo } = req.body;

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

// Tareas
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

app.get('/usuarios/:id/tareas', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json(usuario.tareas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener tareas', error });
  }
});
// Eliminar tarea
app.delete('/usuarios/:userId/tareas/:tareaId', async (req, res) => {
  const { userId, tareaId } = req.params;

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.tareas = usuario.tareas.filter(
      tarea => tarea._id.toString() !== tareaId
    );

    await usuario.save();
    res.status(200).json({ mensaje: 'Tarea eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    res.status(500).json({ mensaje: 'Error al eliminar tarea', error });
  }
});
// Evaluaciones
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

app.get('/usuarios/:id/evaluaciones', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json(usuario.evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evaluaciones', error });
  }
});
// Eliminar evaluación
app.delete('/usuarios/:userId/evaluaciones/:evalId', async (req, res) => {
  const { userId, evalId } = req.params;

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    // Filtrar las evaluaciones excluyendo la que se desea eliminar
    usuario.evaluaciones = usuario.evaluaciones.filter(
      (ev) => ev._id.toString() !== evalId
    );

    await usuario.save();

    res.status(200).json({ mensaje: 'Evaluación eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar evaluación:', error);
    res.status(500).json({ mensaje: 'Error al eliminar evaluación', error });
  }
});
// ==========================
// Servidor
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
