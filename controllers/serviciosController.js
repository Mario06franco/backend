const Servicio = require('../models/servicio');

// Crear nuevo servicio
// controllers/serviciosController.js
exports.crearServicio = async (req, res) => {
  try {
    console.log('📥 Datos recibidos:', req.body);
    
    // Extraer datos con valores por defecto
    const servicioData = {
      nombre: req.body.nombre?.trim(),
      precio: Number(req.body.precio),
      descripcion: req.body.descripcion?.trim(),
      duracion: req.body.duracion?.trim(),
      categoria: req.body.categoria?.trim() || 'otros', // ← Valor por defecto
      indicaciones: req.body.indicaciones?.trim() || 'Por definir',
      frecuencia_recomendada: req.body.frecuencia_recomendada?.trim() || 'Por definir',
      contraindicaciones: req.body.contraindicaciones?.trim() || 'Ninguna',
      imagen: req.body.imagen?.trim(),
      activo: req.body.activo !== undefined ? req.body.activo : true
    };

    console.log('📝 Datos procesados:', servicioData);

    // Validar campos requeridos
    const requiredFields = ['nombre', 'precio', 'descripcion', 'duracion', 'categoria', 'imagen'];
    const missingFields = requiredFields.filter(field => !servicioData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Faltan campos requeridos: ${missingFields.join(', ')}`
      });
    }

    // Crear y guardar el servicio
    const servicio = new Servicio(servicioData);
    await servicio.save();

    console.log('💾 Servicio guardado:', servicio);

    // Responder con TODOS los datos
    res.status(201).json({
      success: true,
      message: 'Servicio creado exitosamente',
      data: servicio
    });

  } catch (error) {
    console.error('❌ Error al crear servicio:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Error de validación',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};

// Obtener todos los servicios
exports.obtenerServicios = async (req, res) => {
  try {
    const servicios = await Servicio.find({ activo: true })
      .sort({ fecha_creacion: -1 });

    res.status(200).json({
      success: true,
      count: servicios.length,
      data: servicios
    });
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicios'
    });
  }
};

// Obtener servicio por ID
exports.obtenerServicioPorId = async (req, res) => {
  try {
    const servicio = await Servicio.findById(req.params.id);
    
    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener servicio'
    });
  }
};

// Actualizar servicio
exports.actualizarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Servicio actualizado exitosamente',
      data: servicio
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar servicio'
    });
  }
};

// Eliminar servicio (soft delete)
exports.eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByIdAndUpdate(
      req.params.id,
      { activo: false },
      { new: true }
    );

    if (!servicio) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Servicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar servicio'
    });
  }
};