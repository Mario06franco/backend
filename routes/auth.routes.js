// routes/auth.routes.js

const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authenticateToken = require('../middleware/auth.middleware');
const JWT_SECRET = process.env.JWT_SECRET;


// 📌 Registro de usuario
router.post('/registrar', async (req, res) => {
  try {
    const { nombre, cedula, correo, celular, password } = req.body;

    if (!nombre || !cedula || !correo || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    const existingUser = await Usuario.findOne({
      $or: [{ correo }, { cedula }]
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con este correo o cédula' });
    }

    

    const newUser = new Usuario({
      nombre,
      cedula,
      correo,
      celular: celular || '',
      password,
      rol: 'cliente'
    });

    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, correo: newUser.correo, rol: newUser.rol },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: newUser._id,
        nombre: newUser.nombre,
        correo: newUser.correo,
        cedula: newUser.cedula,
        celular: newUser.celular,
        rol: newUser.rol
      },
      token
    });

  } catch (error) {
    console.error('❌ Error en registro:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El correo electrónico o cédula ya está en uso' });
    }
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Login mejorado con verificación de existencia de contraseña
router.post('/login', async (req, res) => {
  try {
    const { identificador, password } = req.body;

    console.log('🔐 Intento de login:', { identificador });

    // Validación básica
    if (!identificador || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    // Buscar usuario por cédula o correo (case insensitive)
    const usuario = await Usuario.findOne({
      $or: [
        { cedula: identificador },
        { correo: identificador.toLowerCase() } // ✅ Case insensitive
      ]
    }).select('+password');

    if (!usuario) {
      console.log('❌ Usuario no encontrado');
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    console.log('✅ Usuario encontrado:', usuario.correo);

    if (!usuario.password) {
      console.log('❌ Usuario sin contraseña registrada');
      return res.status(500).json({ message: 'El usuario no tiene contraseña registrada' });
    }

    // Comparar contraseñas
    const isMatch = await bcrypt.compare(password, usuario.password);
    console.log('🔑 Resultado comparación:', isMatch);

    if (!isMatch) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // ✅ CORREGIDO: Usar process.env.JWT_SECRET directamente
    const token = jwt.sign(
      { 
        id: usuario._id, 
        correo: usuario.correo, // ✅ Agregar correo
        rol: usuario.rol 
      },
      process.env.JWT_SECRET, // ✅ CORRECTO
      { expiresIn: '1d' }
    );

    console.log('✅ Login exitoso para:', usuario.correo);

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        cedula: usuario.cedula, // ✅ Agregar cédula
        celular: usuario.celular, // ✅ Agregar celular
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
});
// 📍 Endpoint para RESETEO FORZADO
router.post('/reset-forzado', async (req, res) => {
  try {
    const { correo, nuevaPassword } = req.body;

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hashedPassword;
    await usuario.save();

    res.json({
      message: 'Contraseña reseteada exitosamente',
      correo: correo,
      nuevoHash: hashedPassword
    });

  } catch (error) {
    console.error('Error en reset forzado:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Agrega este endpoint temporal para resetear contraseñas
router.post('/reset-password', async (req, res) => {
  try {
    const { correo, nuevaPassword } = req.body;

    const usuario = await Usuario.findOne({ correo: correo.toLowerCase() });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(nuevaPassword, 10);
    usuario.password = hashedPassword;
    await usuario.save();

    res.json({ 
      message: 'Contraseña actualizada correctamente',
      nuevoHash: hashedPassword 
    });

  } catch (error) {
    console.error('Error resetando password:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// 👤 Obtener perfil de usuario
router.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const user = await Usuario.findById(req.user.id)
      .select('-password -__v');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      _id: user._id,
      nombre: user.nombre,
      cedula: user.cedula,
      correo: user.correo,
      celular: user.celular,
      rol: user.rol,
      estado: user.estado
    });
  } catch (error) {
    console.error('❌ Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// ✏️ Actualizar datos de usuario - VERSIÓN MEJORADA
// ✏️ Actualizar datos de usuario - VERSIÓN QUE SÍ FUNCIONA
router.put('/:cedula', authenticateToken, async (req, res) => {
  try {
    const { cedula } = req.params;
    const { nombre, correo, celular, password } = req.body;

    console.log('🔍 Buscando usuario con cédula:', cedula);
    
    // ✅ BUSCAR SIN EXCLUIR PASSWORD
    const usuario = await Usuario.findOne({ cedula });
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar autorización
    if (req.user.id !== usuario._id.toString() && req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No autorizado' });
    }

    // Validar que el nuevo correo no exista en otro usuario
    if (correo && correo !== usuario.correo) {
      const existingEmail = await Usuario.findOne({
        correo: correo.toLowerCase(),
        _id: { $ne: usuario._id }
      });
      if (existingEmail) {
        return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
      }
    }

    // ✅ ACTUALIZAR CAMPOS DIRECTAMENTE EN EL USUARIO ENCONTRADO
    if (nombre && nombre.trim() !== '') usuario.nombre = nombre;
    if (correo && correo.trim() !== '') usuario.correo = correo.toLowerCase();
    if (celular && celular.trim() !== '') usuario.celular = celular;

    // ✅ ACTUALIZAR CONTRASEÑA SI SE PROPORCIONA
    let passwordUpdated = false;
    if (password && password.trim() !== '') {
      console.log('🔐 Hasheando nueva contraseña...');
      usuario.password = await bcrypt.hash(password, 10);
      passwordUpdated = true;
      console.log('✅ Contraseña hasheada correctamente');
    }

    // ✅ GUARDAR DIRECTAMENTE (SIN FINDONEANDUPDATE QUE PUEDE TENER SELECT)
    await usuario.save();

    console.log('💾 Usuario actualizado con hash:', {
      _id: usuario._id,
      nombre: usuario.nombre,
      cedula: usuario.cedula,
      correo: usuario.correo,
      celular: usuario.celular,
      rol: usuario.rol,
      password: usuario.password, // ← ¡AHORA SÍ DEBERÍA ESTAR!
      passwordLength: usuario.password ? usuario.password.length : 0
    });

    // ✅ RESPONSE
    res.json({
      message: 'Usuario actualizado correctamente',
      user: {
        id: usuario._id,
        nombre: usuario.nombre,
        cedula: usuario.cedula,
        correo: usuario.correo,
        celular: usuario.celular,
        rol: usuario.rol
      },
      debug: {
        passwordUpdated: passwordUpdated,
        hashLength: passwordUpdated ? usuario.password.length : 0
      }
    });

  } catch (error) {
    console.error('❌ Error al actualizar usuario:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: 'El correo electrónico o cédula ya está en uso' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Datos de entrada inválidos' });
    }
    
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});
module.exports = router;