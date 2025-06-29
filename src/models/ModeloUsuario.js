const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    nom_usuario: { 
      type: String, 
      required: true,
      unique: true // Evita duplicados
    },
    correo: { 
      type: String, 
      required: true,
      unique: true,
      match: /^\S+@\S+\.\S+$/ // Validación simple de email
    },
    contrasena: { type: String, required: true, minlength: 6 },

  tareas: [
    {
        titulo: String,
        descripcion: String,
        prioridad: String,
        fecha_limite: Date,
        subtareas: [
            {
            nombre_sub: String,
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
