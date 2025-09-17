const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario'); // Asegúrate de que esta ruta sea correcta

// Registrar un nuevo usuario
exports.registerUser = async (req, res) => {
  const { nombre, cedula, celular, email, rol, contraseña } = req.body;

  try {
    // Verificamos si el email ya está registrado
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Creación del nuevo usuario
    const user = new User({
      nombre,
      cedula,
      celular,
      email,
      rol,
      contraseña: rol === 'admin' ? cedula : contraseña, // La contraseña del admin será igual a la cédula
    });

    await user.save();

    // Generamos el JWT
    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(201).json({
      message: 'Usuario creado con éxito',
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Iniciar sesión
exports.loginUser = async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    // Buscar al usuario por el correo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Usuario no encontrado' });
    }

    // Comprobamos la contraseña
    const isMatch = await user.matchPassword(contraseña);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generamos el JWT
    const token = jwt.sign({ id: user._id, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: '1d',
    });

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, cedula, celular, correo, rol, estado } = req.body;

    const usuario = await Usuario.findById(id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.nombre = nombre || usuario.nombre;
    usuario.cedula = cedula || usuario.cedula;
    usuario.celular = celular || usuario.celular;
    usuario.correo = correo || usuario.correo;
    usuario.rol = rol || usuario.rol;
    usuario.estado = typeof estado === 'boolean' ? estado : usuario.estado;

    await usuario.save();

    res.json({ message: 'Usuario actualizado correctamente', usuario });

  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar usuario', error });
  }
};

module.exports = {
  actualizarUsuario,
  // otros controladores si tienes...
};

