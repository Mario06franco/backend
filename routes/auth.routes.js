const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { actualizarUsuario } = require('../controllers/auth.controller');


const JWT_SECRET = process.env.JWT_SECRET;
const authenticate = require('../middleware/auth.middleware'); // Importar el middleware

// Ruta protegida (requiere autenticación)
router.get('/perfil', authenticate, (req, res) => {
  res.json({
    message: 'Acceso autorizado',
    user: req.user, // Datos del usuario autenticado
  });
});
// Registro mejorado con hash de contraseña
router.post('/registrar', async (req, res) => {
  try {
    const { nombre, cedula, correo, celular, password, rol } = req.body;

    // Validación básica
    if (!nombre || !cedula || !correo || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Verificar si el usuario ya existe
    const existeUsuario = await Usuario.findOne({ $or: [{ cedula }, { correo }] });
    if (existeUsuario) {
      return res.status(400).json({ message: 'Ya existe un usuario con esa cédula o correo' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const nuevoUsuario = new Usuario({
      nombre,
      cedula,
      correo,
      celular,
      password: hashedPassword,
      rol: rol || 'cliente'
    });

    await nuevoUsuario.save();

    // Generar token JWT
    const token = jwt.sign(
      { id: nuevoUsuario._id, rol: nuevoUsuario.rol },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Usuario registrado correctamente',
      token,
      user: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});

// Login mejorado con comparación de hash
router.post('/login', async (req, res) => {
  try {
    const { identificador, password } = req.body;

    // Buscar usuario por cédula o correo
    const usuario = await Usuario.findOne({
      $or: [{ cedula: identificador }, { correo: identificador }]
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, usuario.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: usuario._id, rol: usuario.rol },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: usuario.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});


// Actualizar usuario
router.put('/usuarios/:id', actualizarUsuario);


module.exports = router;
