const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'El nombre del servicio es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  precio: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  descripcion: {
    type: String,
    required: [true, 'La descripción es requerida'],
    trim: true,
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  duracion: {
    type: String,
    required: [true, 'La duración es requerida'],
    trim: true
  },
  categoria: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: {
      values: ['facial', 'corporal', 'relajante', 'otros'],
      message: 'Categoría no válida'
    }
  },
  indicaciones: {
    type: String,
    default: 'Por definir',
    trim: true,
    maxlength: [500, 'Las indicaciones no pueden exceder 500 caracteres']
  },
  frecuencia_recomendada: {
    type: String,
    default: 'Por definir',
    trim: true,
    maxlength: [100, 'La frecuencia no puede exceder 100 caracteres']
  },
  contraindicaciones: {
    type: String,
    default: 'Ninguna',
    trim: true,
    maxlength: [500, 'Las contraindicaciones no pueden exceder 500 caracteres']
  },
  imagen: {
    type: String,
    required: [true, 'La imagen es requerida'],
    trim: true
  },
  activo: {
    type: Boolean,
    default: true
  },
  id_servicio: {
    type: String,
    unique: true,
    trim: true
  }
}, {
  timestamps: {
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_actualizacion'
  }
});

// Generar ID automático antes de guardar
servicioSchema.pre('save', async function(next) {
  if (!this.id_servicio) {
    const count = await this.constructor.countDocuments();
    this.id_servicio = `SERV-${(count + 1).toString().padStart(4, '0')}${Math.random().toString(36).substr(2, 3).toUpperCase()}`;
  }
  next();
});

// Quitar campos no necesarios en las respuestas JSON
servicioSchema.methods.toJSON = function() {
  const servicio = this.toObject();
  delete servicio.__v;
  return servicio;
};

module.exports = mongoose.model('Servicio', servicioSchema);