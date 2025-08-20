require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const citasRoutes = require('./routes/citasRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const authRoutes = require('./routes/auth.routes');  
const usuariosRoutes = require('./routes/user.routes');
const historiasRoutes = require('./routes/historias');
const serviciosRoutes = require('./routes/serviciosRoutes');
const multer = require('multer');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const PORT = process.env.PORT || 3001;

// Configuración de Express
const app = express();

// Configuración mejorada de CORS
const corsOptions = {
  origin: [
    'https://www.pruebasenproduccion.site',
    'https://pruebasenproduccion.site',
    'http://localhost:5174',
    'http://localhost:5173', // ← Asegúrate de incluir este
    'https://leclat-git-main-mario-francos-projects.vercel.app',
    'https://leclat-app.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG)'));
  }
});

// Ruta para subir imágenes
app.post('/api/upload', upload.single('imagen'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No se subió ninguna imagen' });
  }
  
  res.json({
    success: true, 
    url: `/uploads/${req.file.filename}`
  });
});

// Servir archivos estáticos
app.use('/uploads', express.static('public/uploads'));

// Ruta principal
app.get("/", (req, res) => {
  res.json({
    message: "¡Bienvenido al backend de Leclat!",
    endpoints: {
      citas: "/api/citas",
      contacto: "/api/contacto",
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      historias: "/api/historias",
      servicios: "/api/servicios",
      upload: "/api/upload"
    }
  });
});

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ Conectado a MongoDB Atlas');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1);
  }
};
connectDB();

// Importar modelo User
const User = require('./models/User');

// Middleware de autenticación
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Ruta de registro
app.post('/api/auth/registrar', async (req, res) => {
  try {
    const { nombre, cedula, correo, telefono, password } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({
      $or: [{ correo }, { cedula }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'Ya existe un usuario con este correo o cédula' 
      });
    }

    // Crear nuevo usuario
    const newUser = new User({
      nombre,
      cedula,
      correo,
      telefono: telefono || '',
      password,
      rol: 'usuario'
    });

    await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: newUser._id, 
        correo: newUser.correo,
        rol: newUser.rol 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: {
        nombre: newUser.nombre,
        correo: newUser.correo,
        cedula: newUser.cedula,
        rol: newUser.rol
      },
      token
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta de login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identificador, password } = req.body;

    if (!identificador || !password) {
      return res.status(400).json({ message: 'Cédula/correo y contraseña son requeridos' });
    }

    // Buscar usuario por cédula o correo
    const user = await User.findOne({
      $or: [
        { correo: identificador },
        { cedula: identificador }
      ]
    });

    if (!user || !user.estado) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Contraseña invalida' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        correo: user.correo,
        rol: user.rol 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      user: {
        nombre: user.nombre,
        correo: user.correo,
        cedula: user.cedula,
        rol: user.rol
      },
      token
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para recuperación de contraseña
// Ruta para recuperación de contraseña - VERSIÓN DESARROLLO
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    
    if (!identifier) {
      return res.status(400).json({ 
        success: false,
        message: 'Se requiere cédula o correo electrónico' 
      });
    }
    
    // Buscar usuario por cédula o correo
    const user = await User.findOne({
      $or: [
        { correo: identifier },
        { cedula: identifier }
      ]
    });
    
    if (!user) {
      return res.status(200).json({ 
        success: true,
        message: 'Si existe una cuenta con ese correo o cédula, se enviará un enlace de recuperación' 
      });
    }
    
    // Generar token de restablecimiento
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;
    
    // Guardar token en la base de datos
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();
    
    // En desarrollo: mostrar enlace en consola
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    console.log('🔗 ENLACE DE RECUPERACIÓN (DESARROLLO):', resetUrl);
    console.log('📧 Para:', user.correo);
    console.log('👤 Usuario:', user.nombre);
    
    res.status(200).json({ 
      success: true,
      message: `Enlace de recuperación generado. Revisa la consola del servidor para obtener el enlace.`,
      developmentInfo: process.env.NODE_ENV === 'development' ? {
        resetUrl: resetUrl,
        email: user.correo,
        token: resetToken
      } : undefined
    });
    
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error del servidor' 
    });
  }
});

// Ruta para validar token de restablecimiento
app.get('/api/auth/validate-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ valid: false, message: 'El token es inválido o ha expirado' });
    }
    
    res.status(200).json({ valid: true, message: 'Token válido' });
  } catch (error) {
    console.error('Error en validate-token:', error);
    res.status(500).json({ valid: false, message: 'Error del servidor' });
  }
});

// Ruta para restablecer la contraseña
app.post('/api/auth/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: 'El token es inválido o ha expirado' });
    }
    
    // Actualizar contraseña (el middleware pre-save se encargará de hashearla)
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error en reset-password:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Ruta para obtener perfil de usuario
app.get('/api/auth/perfil', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

// Configuración de rutas existentes
app.use('/api', usuariosRoutes);
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/citas', citasRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend funcionando correctamente ✅' });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande' });
    }
  }
  
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
});

// Exportar la app para que Vercel la pueda usar
module.exports = app;