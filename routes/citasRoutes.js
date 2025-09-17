const express = require('express');
const Cita = require('../models/Cita'); // Importa el modelo de Cita
const User = require('../models/User'); // Agrega esta línea

const router = express.Router();

// Verificar disponibilidad de horas en una fecha específica
router.get('/disponibilidad', async (req, res) => {
  const { fecha } = req.query;
  
  try {
    const citas = await Cita.find({ fecha });
    const horasOcupadas = citas.map(cita => cita.hora);
    res.json({ horasOcupadas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener disponibilidad' });
  }
});

// Verificar si una cita ya existe en una fecha y hora específica
router.get('/verificar', async (req, res) => {
  const { fecha, hora } = req.query;

  try {
    const cita = await Cita.findOne({ fecha, hora });
    res.json({ existe: !!cita });
  } catch (error) {
    res.status(500).json({ error: 'Error al verificar cita' });
  }
});


// Obtener todas las citas
// Obtener todas las citas o filtradas por estado
router.get('/', async (req, res) => {
  try {
    const { estado } = req.query;

    let query = {};
    if (estado) {
      query.estado = estado;
    }

    const citas = await Cita.find(query);
    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
});




// Agendar una nueva cita
router.post('/agendar', async (req, res) => {
  // Extraer solo los campos definidos en el modelo
  const { nombre, cedula, fecha, hora, servicio, limitacion } = req.body;

  try {
    // Validación mejorada
    if (!nombre || !cedula || !fecha || !hora || !servicio) {
      return res.status(400).json({
        error: 'Faltan campos requeridos',
        detalles: {
          nombre: !nombre,
          cedula: !cedula,
          fecha: !fecha,
          hora: !hora,
          servicio: !servicio
        }
      });
    }

    // Crear cita con solo los campos necesarios
    const nuevaCita = new Cita({
      nombre,
      cedula,
      fecha,
      hora,
      servicio,
      ...(limitacion && { limitacion }), // Solo añade si existe
      // estado se asigna por default en el modelo
      // creado se asigna automáticamente
    });

    await nuevaCita.save();
    
    res.status(201).json({ 
      mensaje: 'Cita agendada con éxito',
      citaId: nuevaCita._id 
    });

  } catch (error) {
    console.error('Error en base de datos:', error);
    res.status(500).json({ 
      error: 'Error al guardar la cita',
      ...(process.env.NODE_ENV === 'development' && {
        detalle: error.message,
        stack: error.stack
      })
    });
  }
});

// PUT /api/citas/:id → Editar una cita por su _id
router.put('/:id', async (req, res) => {
  try {
    const citaActualizada = await Cita.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!citaActualizada) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.status(200).json({ message: 'Cita actualizada con éxito', cita: citaActualizada });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar cita EN EL BACKEND', error: error.message });
  }
});


router.get('/verificar-usuario', async (req, res) => {
  try {
    const { cedula, correo } = req.query;

    if (!cedula && !correo) {
      return res.status(400).json({ mensaje: 'Se requiere cédula o correo' });
    }

    let usuarios;

    if (cedula) {
      usuarios = await User.findOne({ cedula: cedula });
    } else if (correo) {
      usuarios = await User.findOne({ correo: correo });
    }

    if (!usuarios) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.status(200).json({ mensaje: 'Usuario encontrado', usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error del servidor', error: error.message });
  }
});

router.put('/:id/cancelar', async (req, res) => {
  const { id } = req.params;

  try {
    const citaCancelada = await Cita.findByIdAndUpdate(
      id,
      { estado: 'cancelada' },
      { new: true }
    );

    if (!citaCancelada) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita cancelada con éxito', cita: citaCancelada });
  } catch (error) {
    console.error('Error al cancelar cita:', error);
    res.status(500).json({ message: 'Error al cancelar la cita' });
  }
});


// Activar cita (actualiza el estado a "activa")
router.put('/:id/activar', async (req, res) => {
  const { id } = req.params;

  try {
    const citaActivada = await Cita.findByIdAndUpdate(
      id,
      { estado: 'activa' },
      { new: true }
    );

    if (!citaActivada) {
      return res.status(404).json({ message: 'Cita no encontrada' });
    }

    res.json({ message: 'Cita activada con éxito', cita: citaActivada });
  } catch (error) {
    console.error('Error al activar cita:', error);
    res.status(500).json({ message: 'Error al activar la cita' });
  }
});




module.exports = router;
