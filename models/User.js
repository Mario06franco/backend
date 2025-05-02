// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  cedula: {
    type: String,
    required: true,
    unique: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  nombre: {
    type: String,
    required: true,
  },
  telefono: {
    type: String,
    required: false,
  },
  rol: {
    type: String,
    enum: ['admin', 'colaboradora', 'usuario'],
    default: 'usuario', // se puede sobrescribir al registrar desde el backend admin
  },
  estado: {
    type: Boolean,
    default: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema, "usuarios");
