const Servicio = require('../models/servicio');
const { v4: uuidv4 } = require('uuid');

// Crear un nuevo servicio
exports.crearServicio = async (req, res) => {
  try {
    const servicio = new Servicio(req.body);
    await servicio.save();
    res.status(201).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'El ID de servicio ya existe'
      });
    }
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtener todos los servicios
exports.obtenerServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find(); // Elimina el filtro `{ activo: true }` si quieres todos los servicios
    res.status(200).json({
      success: true,
      count: servicios.length,
      data: servicios
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Obtener un servicio por ID
exports.obtenerServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ 
      $or: [
        { _id: req.params.id },
        { id_servicio: req.params.id }
      ],
      activo: true
    });

    if (!servicio) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Actualizar un servicio
exports.actualizarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { id_servicio: req.params.id }
        ]
      },
      req.body,
      { new: true, runValidators: true }
    );

    if (!servicio) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Eliminar un servicio (borrado lógico)
exports.eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findOneAndUpdate(
      { 
        $or: [
          { _id: req.params.id },
          { id_servicio: req.params.id }
        ]
      },
      { activo: false },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};