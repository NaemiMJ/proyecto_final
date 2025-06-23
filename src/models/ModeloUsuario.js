const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: String,
  nom_usuario: String,
  correo: String,
  contrasena: String,

  tareas: [
    {
        titulo: String,
        descripcion: String,
        etiquetas: String,
        prioridad: String,
        estado: String,
        fecha_limite: Date,
        subtareas: [
            {
            nombre_sub: String,
            estado_sub: String,
            finalizada_sub: Boolean
            }
        ],
        finalizada: Boolean
    }
  ],

  evaluaciones:[
    {
      materia: String,
      fecha_ev: Date,
      recordatorio: Boolean,
    }
  ]
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports = { Usuario };
