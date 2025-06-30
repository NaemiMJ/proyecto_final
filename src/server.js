const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { Usuario } = require('./models/ModeloUsuario');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================
// Middleware global
// ==========================
app.use(cors({
  origin: (origin, callback) => callback(null, true),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Conexión a MongoDB
// ==========================
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

// --- LOGIN ---
app.post('/api/login', async (req, res) => {
  const { identificador, password } = req.body;

  if (!identificador || !password) {
    return res.status(400).json({ mensaje: 'Faltan datos de login' });
  }

  try {
    const usuario = await Usuario.findOne({
      $or: [{ correo: identificador }, { nom_usuario: identificador }]
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

// --- REGISTRO ---
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

// --- TAREAS ---

// Crear nueva tarea
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

// Obtener todas las tareas de un usuario
app.get('/usuarios/:userId/tareas', async (req, res) => {
  const { userId } = req.params;

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      console.log(`❌ Usuario con ID ${userId} no encontrado`);
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    console.log(`✅ Tareas obtenidas para usuario ${userId}`);
    return res.json(usuario.tareas);
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    return res.status(500).json({ mensaje: 'Error al obtener tareas', error });
  }
});

// Eliminar una tarea por ID
app.delete('/usuarios/:userId/tareas/:tareaId', async (req, res) => {
  const { userId, tareaId } = req.params;

  console.log(`🔍 Eliminando tarea ${tareaId} del usuario ${userId}`);

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      console.log(`❌ Usuario no encontrado: ${userId}`);
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const originalLength = usuario.tareas.length;
    usuario.tareas = usuario.tareas.filter(tarea => tarea._id.toString() !== tareaId);

    if (usuario.tareas.length === originalLength) {
      console.log(`⚠️ Tarea no encontrada: ${tareaId}`);
      return res.status(404).json({ mensaje: 'Tarea no encontrada' });
    }

    await usuario.save();

    console.log(`✅ Tarea eliminada correctamente`);
    return res.status(200).json({ mensaje: 'Tarea eliminada correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    return res.status(500).json({ mensaje: 'Error interno al eliminar tarea', error });
  }
});

app.patch('/usuarios/:userId/tareas/:tareaId', async (req, res) => {
  const { userId, tareaId } = req.params;
  const { finalizada } = req.body;

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const tarea = usuario.tareas.id(tareaId);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    tarea.finalizada = finalizada;
    await usuario.save();

    res.json({ mensaje: "Tarea actualizada" });
  } catch (error) {
    console.error("❌ Error en PATCH:", error);
    res.status(500).json({ mensaje: "Error al actualizar tarea" });
  }
});

// Actualizar estado de subtarea
app.patch('/usuarios/:userId/tareas/:tareaId/subtareas/:subIndex', async (req, res) => {
  const { userId, tareaId, subIndex } = req.params;
  const { finalizada_sub } = req.body;

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) return res.status(404).json({ mensaje: "Usuario no encontrado" });

    const tarea = usuario.tareas.id(tareaId);
    if (!tarea) return res.status(404).json({ mensaje: "Tarea no encontrada" });

    const subtarea = tarea.subtareas[subIndex];
    if (!subtarea) return res.status(404).json({ mensaje: "Subtarea no encontrada" });

    subtarea.finalizada_sub = finalizada_sub;
    await usuario.save();

    res.json({ mensaje: "Subtarea actualizada" });
  } catch (error) {
    console.error("❌ Error al actualizar subtarea:", error);
    res.status(500).json({ mensaje: "Error al actualizar subtarea" });
  }
});

// --- EVALUACIONES ---

// Crear evaluación
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

// Obtener evaluaciones
app.get('/usuarios/:id/evaluaciones', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.status(200).json(usuario.evaluaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener evaluaciones', error });
  }
});
app.delete('/usuarios/:userId/evaluaciones/:evalId', async (req, res) => {
  const { userId, evalId } = req.params;

  console.log(`🔍 Eliminando evaluación ${evalId} del usuario ${userId}`);

  try {
    const usuario = await Usuario.findById(userId);
    if (!usuario) {
      console.log(`❌ Usuario no encontrado: ${userId}`);
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const originalLength = usuario.evaluaciones.length;
    usuario.evaluaciones = usuario.evaluaciones.filter(ev => ev._id.toString() !== evalId);

    if (usuario.evaluaciones.length === originalLength) {
      console.log(`⚠️ Evaluación no encontrada: ${evalId}`);
      return res.status(404).json({ mensaje: 'Evaluación no encontrada' });
    }

    await usuario.save();

    console.log(`✅ Evaluación eliminada correctamente`);
    return res.status(200).json({ mensaje: 'Evaluación eliminada correctamente' });

  } catch (error) {
    console.error('❌ Error al eliminar evaluación:', error);
    return res.status(500).json({ mensaje: 'Error interno al eliminar evaluación', error });
  }
});


// GET /usuarios/:id
app.get('/usuarios/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
});
// ==========================
// Iniciar servidor
// ==========================
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});