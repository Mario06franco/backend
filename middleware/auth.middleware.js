const User = require('../models/Usuario'); // Modelo de usuario
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  console.log('🔐 Middleware de autenticación ejecutándose');
  
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  console.log('📨 Header Authorization:', authHeader);
  console.log('🔑 Token recibido:', token ? `SI (${token.substring(0, 20)}...)` : 'NO');

  if (!token) {
    console.log('❌ Token no proporcionado');
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('✅ Token válido para usuario:', decoded.correo || decoded.id);
    
    // Asegurarse de que req.user tenga la estructura correcta
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol
    };
    
    next();
  } catch (error) {
    console.error('❌ Error verificando token:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado' });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido' });
    }
    
    return res.status(403).json({ message: 'Token no válido' });
  }
};

module.exports = authenticateToken;