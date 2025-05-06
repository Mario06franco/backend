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

// Configuración de Express
const app = express();

const allowedOrigins = [
  'https://www.pruebasenproduccion.site',
  'https://pruebasenproduccion.site', // Por si falta el www
  'http://localhost:3000' // Para desarrollo
];

const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Dominio no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); 

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Agrega esto después de los middlewares y antes de las otras rutas
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
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://mariofraco93:Ma104291*@leclatdb.dvt9irn.mongodb.net/?retryWrites=true&w=majority&appName=LeclatDB')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Configuración de rutas
app.use('/api', usuariosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/contacto', contactoRoutes);
app.use('/api/historias', historiasRoutes);
app.use('/api/servicios', serviciosRoutes);
app.use('/api/upload', uploadRoutes);

// Al final del archivo, después de las rutas
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Algo salió mal en el servidor' });
});

// Exportar la app para que Vercel la pueda usar
module.exports = app;
