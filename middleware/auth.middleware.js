const jwt = require('jsonwebtoken');
const User = require('../models/User');  // Modelo de usuario

// Middleware de autenticación
const authenticate = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');  // Extraer el token de los encabezados
  
  if (!token) {
    return res.status(401).json({ message: 'Acceso no autorizado: No se proporcionó el token' });
  }

  try {
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar al usuario en la base de datos usando el ID decodificado
    const user = await User.findById(decoded.id);

    // Si el usuario no existe en la base de datos
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    // Agregar los datos del usuario al objeto de la solicitud
    req.user = user;

    // Continuar con la siguiente función de middleware o ruta
    next();
  } catch (error) {
    console.error('Error al verificar el token:', error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

module.exports = authenticate;
