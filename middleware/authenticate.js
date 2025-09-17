const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Modelo de usuario

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Extraer el token de los encabezados
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);  // Verificar el token
    const user = await User.findById(decoded.id);  // Buscar al usuario en la base de datos
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    req.user = user;  // Agregar los datos del usuario al objeto de la solicitud
    next();  // Continuar con la siguiente ruta
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authenticate;
