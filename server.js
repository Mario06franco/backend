// Determinar qué archivo .env cargar según el entorno
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
require('dotenv').config({ path: envFile });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Importar rutas
const citasRoutes = require('./routes/citasRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const authRoutes = require('./routes/auth.routes');  
const usuariosRoutes = require('./routes/user.routes');
const historiasRoutes = require('./routes/historias');
const serviciosRoutes = require('./routes/serviciosRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Importar conexión a la base de datos
const connectDB = require('./config/db');

// Solo definir PORT si no estamos en Vercel/producción
const PORT = process.env.PORT || 3001;

// Configuración de Express
const app = express();

// Configuración mejorada de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como apps móviles o Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://www.pruebasenproduccion.site',
      'https://pruebasenproduccion.site',
      'http://localhost:5174',
      'http://192.168.1.83:5174',
      'http://localhost:5173',
      'https://leclat-git-main-mario-francos-projects.vercel.app',
      'https://leclat-app.vercel.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF, WEBP)'));
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
    environment: process.env.NODE_ENV,
    endpoints: {
      citas: "/api/citas",
      contacto: "/api/contacto",
      auth: "/api/auth",
      usuarios: "/api/usuarios",
      historias: "/api/historias",
      servicios: "/api/servicios",
      upload: "/api/upload",
      status: "/api/status",
      health: "/api/health"
    }
  });
});

// Conectar a la base de datos
connectDB();

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/upload', uploadRoutes);

// Ruta de estado
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'Backend funcionando correctamente ✅',
    environment: process.env.NODE_ENV,
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'El archivo es demasiado grande (máximo 5MB)' });
    }
  }
  
  // Manejo de errores de CORS
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Iniciar servidor SOLO si no estamos en Vercel
if (process.env.NODE_ENV !== 'production' || process.env.VERCEL !== '1') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
    console.log(`📊 Base de datos: ${process.env.NODE_ENV === 'production' ? 'Producción (Atlas)' : 'Desarrollo (Local)'}`);
    console.log(`🔗 URL: http://localhost:${PORT}`);
  });
} else {
  console.log('🚀 Servidor listo para Vercel');
  console.log(`🌐 Ambiente: ${process.env.NODE_ENV}`);
}

// Exportar la app para que Vercel la pueda usar
module.exports = app;