const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Modelo de usuario de MongoDB


// Crear usuario
router.post('/usuarios', async (req, res) => {
  try {
    const newUser = new User(req.body);
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: 'Error creando  aca esta usuario' });
  }
});

// Actualizar usuario
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// Habilitar usuario
router.put('/usuarios/:id/habilitar', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, { habilitado: true }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error habilitando usuario' });
  }
});

// Deshabilitar usuario
router.put('/usuarios/:id/deshabilitar', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedUser = await User.findByIdAndUpdate(id, { habilitado: false }, { new: true });
    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: 'Error deshabilitando usuario' });
  }
});

router.get('/verificar-usuario', async (req, res) => {
  try {
    const { cedula, correo } = req.query;

    if (!cedula && !correo) {
      return res.status(400).json({ mensaje: 'Se requiere cédula o correo' });
    }

    let usuario;

    if (cedula) {
      usuario = await User.findOne({ cedula: cedula });
    } else if (correo) {
      usuario = await User.findOne({ correo: correo });
    }

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario encontrado', usuario });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
});

// Obtener lista de usuarios
// Obtener todos los usuarios (sin filtro)
router.get('/usuarios', async (req, res) => {
  try {
    const { pageSize } = req.query;
    const limite = parseInt(pageSize) || 50;

    const usuarios = await User.find().limit(limite);
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});


module.exports = router;

