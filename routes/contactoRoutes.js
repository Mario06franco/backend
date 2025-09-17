// routes/contactoRoutes.js
const express = require('express');
const router = express.Router();
const Contacto = require('../models/Contacto');

// POST /api/contacto/enviar
router.post('/enviar', async (req, res) => {
  try {
    const { nombre, email, asunto, mensaje } = req.body;

    if (!nombre || !email || !asunto || !mensaje) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }

    const nuevoContacto = new Contacto({
      nombre,
      email,
      asunto,
      mensaje
    });

    await nuevoContacto.save();
    res.status(201).json({ mensaje: '✅ Mensaje enviado con éxito' });

  } catch (error) {
    console.error('Error al guardar contacto:', error);
    res.status(500).json({ mensaje: '❌ Error del servidor' });
  }
});

module.exports = router;
