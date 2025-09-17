const mongoose = require('mongoose');

const citaSchema = new mongoose.Schema({
  userId: { type: String }, // No requerido
  nombre: { type: String, required: true },
  cedula: { type: String, required: true },
  servicio: { type: String, required: true },
  fecha: { type: String, required: true },
  hora: { type: String, required: true },
  limitacion: { type: String },
  estado: { type: String, default: 'activa' },
  creado: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Cita', citaSchema);