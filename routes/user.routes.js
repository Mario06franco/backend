const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();



/**
 * ✅ Registro de usuario
 */
// Editar usuario (usado por admin)
router.put('/usuarios/:id', async (req, res) => {
  try {
    const { nombre, celular, correo, rol, estado } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { nombre, celular, correo, rol, estado },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar usuario:', error.message);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
});

// Crear usuario como administrador
router.post('/admin/create', async (req, res) => {
  const {
    cedula,
    correo,
    nombre,
    celular,
    rol = 'cliente'
  } = req.body;

  if (!cedula?.trim() || !correo?.trim()) {
    return res.status(400).json({
      message: 'Cédula y correo son obligatorios'
    });
  }

  try {
    const [existeCedula, existeCorreo] = await Promise.all([
      User.findOne({ cedula }),
      User.findOne({ correo })
    ]);

    if (existeCedula) {
      return res.status(400).json({ message: 'La cédula ya está registrada' });
    }

    if (existeCorreo) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    const password = await bcrypt.hash(cedula, 10); // 👈 Usamos 'password' ahora

    const nuevoUsuario = new User({
      cedula,
      correo,
      nombre,
      celular,
      password, // 👈 Campo correcto esperado por el modelo
      rol,
      estado: true
    });

    await nuevoUsuario.save();

    res.status(201).json({ message: 'Usuario creado por administrador correctamente' });
  } catch (error) {
    console.error('Error en /admin/create:', error);
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
});


router.post('/register', async (req, res) => {
  const {
    cedula,
    correo,
    nombre,
    celular,
    contraseña,
    rol = 'cliente',
    estado = 'habilitado'
  } = req.body;

  // Validaciones mínimas
  if (!cedula?.trim() || !correo?.trim() || !contraseña?.trim()) {
    return res.status(400).json({
      message: 'Cédula, correo y contraseña son obligatorios'
    });
  }

  if (cedula === correo) {
    return res.status(400).json({
      message: 'La cédula y el correo no pueden ser iguales'
    });
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(correo)) {
    return res.status(400).json({ message: 'Correo electrónico inválido' });
  }

  try {
    // Verificar duplicados
    const [usuarioPorCedula, usuarioPorCorreo] = await Promise.all([
      User.findOne({ cedula }),
      User.findOne({ correo })
    ]);

    if (usuarioPorCedula) {
      return res.status(400).json({ message: 'Ya existe un usuario con esa cédula' });
    }

    if (usuarioPorCorreo) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese correo' });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(contraseña, 10);

    // Crear usuario
    const nuevoUsuario = new User({
      cedula,
      correo,
      nombre,
      celular,
      contraseña: hashedPassword,
      rol,
      estado
    });

    await nuevoUsuario.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
});

/**
 * ✅ Login de usuario (por cédula o correo)
 */
router.post('/login', async (req, res) => {
  const { identificador, contraseña } = req.body;

  if (!identificador?.trim() || !contraseña?.trim()) {
    return res.status(400).json({ message: 'Cédula o correo y contraseña son requeridos' });
  }

  try {
    const user = await User.findOne({
      $or: [{ cedula: identificador }, { correo: identificador }],
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await bcrypt.compare(contraseña, user.contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { id: user._id, cedula: user.cedula, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        cedula: user.cedula,
        correo: user.correo,
        celular: user.celular,
        rol: user.rol,
        estado: user.estado
      }
    });

  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});

router.get('/usuarios', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error.message);
    res.status(500).json({ error: 'pailas al obtener usuarios' });
  }
});

// Deshabilitar usuario
router.put('/usuarios/:id/deshabilitar', async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(req.params.id, { estado: false }, { new: true });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al deshabilitar usuario' });
  }
});

// Habilitar usuario
router.put('/usuarios/:id/habilitar', async (req, res) => {
  try {
    const usuario = await User.findByIdAndUpdate(req.params.id, { estado: true }, { new: true });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ error: 'Error al habilitar usuario' });
  }
});

module.exports = router;
