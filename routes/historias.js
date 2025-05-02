// routes/historias.js

const express = require('express');
const router = express.Router();
const HistoriaClinica = require('../models/historias');
const User = require('../models/Usuario'); // Suponiendo que tienes un modelo User con la cédula del usuario

// Crear historia clínica
router.post('/', async (req, res) => {
  try {
    const { cedula, datosGenerales, historialClinico, estiloVidaYHabitos, cuidadoFacialActual, diagnosticoFacial, planTratamiento } = req.body;
    const usuario = await User.findOne({ cedula });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado con esa cédula' });

    const historiaClinica = new HistoriaClinica({
      cedula,
      datosGenerales,
      historialClinico,
      estiloVidaYHabitos,
      cuidadoFacialActual,
      diagnosticoFacial,
      planTratamiento
    });

    await historiaClinica.save();
    res.status(201).json({ message: 'Historia clínica creada con éxito', data: historiaClinica });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la historia clínica', error: error.message });
  }
});

// Actualizar historia clínica
// En la ruta PUT para actualizar:
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verificar que la historia exista
    const historiaExistente = await HistoriaClinica.findById(id);
    if (!historiaExistente) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }

    // Verificar que la cédula corresponda si se está cambiando
    if (updateData.cedula && updateData.cedula !== historiaExistente.cedula) {
      const usuario = await User.findOne({ cedula: updateData.cedula });
      if (!usuario) {
        return res.status(404).json({ message: 'No existe un usuario con la nueva cédula proporcionada' });
      }
    }

    const historiaActualizada = await HistoriaClinica.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ 
      message: 'Historia clínica actualizada con éxito',
      data: historiaActualizada 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al actualizar la historia clínica',
      error: error.message 
    });
  }
});

// Ruta para obtener todas las historias clínicas
router.get('/', async (req, res) => {
  try {
    const historias = await HistoriaClinica.find();

    // Formatear las fechas de nacimiento
    const historiasFormateadas = historias.map(historia => {
      if (historia.datosGenerales.fechaNacimiento) {
        historia.datosGenerales.fechaNacimiento = new Date(historia.datosGenerales.fechaNacimiento)
          .toISOString()
          .split('T')[0]; // Formato YYYY-MM-DD
      }
      return historia;
    });

    res.status(200).json({ message: 'Historias clínicas obtenidas', data: historiasFormateadas });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las historias clínicas', error: error.message });
  }
});

// Ruta para obtener una historia clínica por su cédula
router.get('/:cedula', async (req, res) => {
  try {
    const historia = await HistoriaClinica.findOne({ cedula: req.params.cedula });
    if (!historia) {
      return res.status(404).json({ message: 'Historia clínica no encontrada' });
    }
    res.status(200).json({ message: 'Historia clínica encontrada', data: historia });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener la historia clínica', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.find({
      categoria: 'facial',
      activo: true
    });
    res.json(servicios); // Devuelve array directamente
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;