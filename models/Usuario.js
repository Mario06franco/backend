const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true, trim: true },
  cedula: { type: String, required: true, unique: true, trim: true },
  correo: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo válido']
  },
  celular: { type: String, trim: true },
  password: { type: String, required: true, select: false },
  rol: { type: String, enum: ['admin', 'cliente', 'empleado'], default: 'cliente' },
  estado: { type: Boolean, default: true }
}, { 
  timestamps: true,
  collection: 'usuarios' // Forzar nombre de colección
});

// Hash de contraseña antes de guardar
usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Método para comparar contraseñas
usuarioSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);