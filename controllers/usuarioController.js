const Usuario = require('../models/Usuario');

// Crear nuevo usuario
const crearUsuario = async (req, res) => {
  try {
    const usuario = new Usuario({
      ...req.body,
      password: req.body.cedula // contraseña = cédula por defecto
    });
    await usuario.save();
    res.status(201).json({ message: 'Usuario creado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error });
  }
};

// Obtener usuarios
const obtenerUsuarios = async (req, res) => {
  const usuarios = await Usuario.find();
  res.json(usuarios);
};

// Actualizar usuario
const actualizarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, req.body);
    res.json({ message: 'Usuario actualizado con éxito' });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};

// Deshabilitar usuario
const deshabilitarUsuario = async (req, res) => {
  try {
    await Usuario.findByIdAndUpdate(req.params.id, { habilitado: false });
    res.json({ message: 'Usuario deshabilitado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al deshabilitar usuario' });
  }
};

module.exports = {
  crearUsuario,
  obtenerUsuarios,
  actualizarUsuario,
  deshabilitarUsuario
};
