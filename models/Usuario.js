// models/Usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  cedula: { type: String, required: true, unique: true },
  correo: { type: String, required: true, unique: true },
  celular: { type: String, required: true },
  password: { type: String, required: true },
  rol: { type: String, default: 'cliente' },
  estado: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);
