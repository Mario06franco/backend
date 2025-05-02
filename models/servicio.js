const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    id_servicio: {
        type: String,
        unique: true,
        default: () => `SERV-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      },
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es obligatorio'],
    trim: true
  },
  imagen: {
    type: String,
    required: [true, 'La imagen del servicio es obligatoria']
  },
  precio: {
    type: Number,
    required: [true, 'El precio del servicio es obligatorio'],
    min: [0, 'El precio no puede ser negativo']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción del servicio es obligatoria'],
    trim: true
  },
  indicaciones: {
    type: String,
    required: [true, 'Las indicaciones del servicio son obligatorias'],
    trim: true
  },
  frecuencia_recomendada: {
    type: String,
    required: [true, 'La frecuencia recomendada es obligatoria'],
    trim: true
  },
  duracion: {
    type: String,
    required: [true, 'La duración del servicio es obligatoria'],
    trim: true
  },
  contraindicaciones: {
    type: String,
    required: [true, 'Las contraindicaciones son obligatorias'],
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  fecha_creacion: {
    type: Date,
    default: Date.now
  }
});

// Generar ID único antes de guardar
servicioSchema.pre('save', async function(next) {
  if (!this.id_servicio) {
    this.id_servicio = 'SERV-' + Date.now().toString().slice(-6);
  }
  next();
});

module.exports = mongoose.model('Servicio', servicioSchema);