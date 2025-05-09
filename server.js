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
const PORT = process.env.PORT || 3001; // 👈 Render necesita esto

// Configuración de Express
const app = express();


const allowedOrigins = [
  'https://www.pruebasenproduccion.site',
  'https://pruebasenproduccion.site',
  'http://localhost:3000',
  'https://leclat-git-main-mario-francos-projects.vercel.app' // Añade tu URL de Vercel
];

const corsOptions = {
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como Postman o móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.includes(allowedOrigin.replace('https://', '').replace('http://', ''))
    )) {
      callback(null, true);
    } else {
      console.error('Dominio no permitido por CORS:', origin);
      callback(new Error('Dominio no permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
  optionsSuccessStatus: 200 // Algunos navegadores necesitan esto
};

// Esto debe estar AL INICIO, antes de cualquier ruta
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Habilitar pre-flight para todas las rutas

// Luego los otros middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});



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

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(err => {
    console.error('❌ Error de conexión a MongoDB:', err);
    process.exit(1); // Detener la aplicación si no hay conexión a DB
  });

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

app.get('/api/status', (req, res) => {
  res.json({ status: 'Backend en Vercel ✅' });
});



// Exportar la app para que Vercel la pueda usar
module.exports = app;
