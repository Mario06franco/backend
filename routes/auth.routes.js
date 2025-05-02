const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const { actualizarUsuario } = require('../controllers/auth.controller');

const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_firmar_token';

// Registro
router.post('/registrar', async (req, res) => {
  try {
    const { nombre, cedula, correo, celular, password, rol, estado } = req.body;

    const existeUsuario = await Usuario.findOne({ $or: [{ cedula }, { correo }] });
    if (existeUsuario) {
      return res.status(400).json({ message: '❌ Ya existe un usuario con esa cédula o correo' });
    }

    const nuevoUsuario = new Usuario({ nombre, cedula, correo, celular, password, rol, estado });
    await nuevoUsuario.save();

    res.status(201).json({ message: '✅ Usuario registrado correctamente' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { identificador, password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      $or: [{ cedula: identificador }, { correo: identificador }],
    });

    if (!usuario) {
      return res.status(404).json({ message: '❌ Usuario no encontrado' });
    }

    if (usuario.password !== password) {
      return res.status(401).json({ message: '❌ Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: '✅ Inicio de sesión exitoso',
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        correo: usuario.correo,
        rol: usuario.rol,
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Actualizar usuario
router.put('/usuarios/:id', actualizarUsuario);


module.exports = router;
