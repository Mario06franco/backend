const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const citasRoutes = require('./routes/citasRoutes');
const contactoRoutes = require('./routes/contactoRoutes');
const authRoutes = require('./routes/auth.routes');  // <-- ESTA LÍNEA ESTÁ CORRECTA
const usuariosRoutes = require('./routes/user.routes');
const app = express();
const historiasRoutes = require('./routes/historias');
const serviciosRoutes = require('./routes/serviciosRoutes'); // Importación de rutas de servicios
const multer = require('multer');
const path = require('path');
const uploadRoutes = require('./routes/uploadRoutes');
// Configurar CORS
app.use(cors({
  origin: 'http://localhost:5173', // Permitir solicitudes desde el frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Cabeceras permitidas
}));

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
app.use('/api/upload', uploadRoutes);
// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
mongoose.connect('mongodb://localhost:27017/leclatDB')
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => console.error('❌ Error de conexión:', err));

// Configuración de rutas
app.use('/api', usuariosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', require('./routes/auth.routes')); // Rutas de autenticación
app.use('/api/citas', citasRoutes);  // Rutas de citas
app.use('/api/auth', authRoutes);  // Rutas de autenticación
app.use('/api/contacto', contactoRoutes);  // Rutas de contacto
app.use('/api/historias', historiasRoutes); // Rutas de historias clínicas
app.use('/api/servicios', serviciosRoutes); // Nuevas rutas de servicios <-- AGREGADO
app.use('/api/upload', uploadRoutes);
// Iniciar servidor
app.listen(5000, () => {
  console.log('🚀 Servidor corriendo en http://localhost:5000');
});