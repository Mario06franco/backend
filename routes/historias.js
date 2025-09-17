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

// Ruta para obtener todas las historias clínicas (solo para admin)
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

// Ruta para obtener TODAS las historias clínicas de un paciente por su cédula
router.get('/cedula/:cedula', async (req, res) => {
  try {
    const historias = await HistoriaClinica.find({ cedula: req.params.cedula });
    
    if (!historias || historias.length === 0) {
      return res.status(404).json({ message: 'No se encontraron historias clínicas para esta cédula' });
    }

    // Formatear las fechas de nacimiento
    const historiasFormateadas = historias.map(historia => {
      if (historia.datosGenerales.fechaNacimiento) {
        historia.datosGenerales.fechaNacimiento = new Date(historia.datosGenerales.fechaNacimiento)
          .toISOString()
          .split('T')[0];
      }
      return historia;
    });

    res.status(200).json({ message: 'Historias clínicas encontradas', data: historiasFormateadas });
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las historias clínicas', error: error.message });
  }
});


// Ruta para obtener TODAS las historias clínicas de un paciente por cédula
router.get('/paciente/:cedula', async (req, res) => {
  try {
    const cedula = req.params.cedula;
    console.log('Buscando historias para cédula:', cedula);
    
    const historias = await HistoriaClinica.find({ cedula: cedula });
    
    console.log('Historias encontradas:', historias.length);
    
    if (!historias || historias.length === 0) {
      return res.status(404).json({ 
        message: 'No se encontraron historias clínicas para esta cédula',
        data: [] 
      });
    }

    // Formatear las fechas
    const historiasFormateadas = historias.map(historia => {
      if (historia.datosGenerales && historia.datosGenerales.fechaNacimiento) {
        historia.datosGenerales.fechaNacimiento = new Date(historia.datosGenerales.fechaNacimiento)
          .toISOString()
          .split('T')[0];
      }
      return historia;
    });

    res.status(200).json({ 
      message: 'Historias clínicas encontradas', 
      data: historiasFormateadas 
    });
  } catch (error) {
    console.error('Error en /paciente/:cedula:', error);
    res.status(500).json({ 
      message: 'Error al obtener las historias clínicas', 
      error: error.message 
    });
  }
});

// Ruta para obtener UNA historia clínica específica por ID (mantener esta)
router.get('/:id', async (req, res) => {
  try {
    const historia = await HistoriaClinica.findById(req.params.id);
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

// Ruta para debug - ver todas las cédulas
router.get('/debug/cedulas', async (req, res) => {
  try {
    const historias = await HistoriaClinica.find({}, 'cedula datosGenerales.nombreCompleto createdAt');
    
    const cedulasUnicas = [...new Set(historias.map(h => h.cedula))];
    
    res.status(200).json({
      totalHistorias: historias.length,
      cedulasUnicas: cedulasUnicas,
      detalles: historias.map(h => ({
        id: h._id,
        cedula: h.cedula,
        nombre: h.datosGenerales?.nombreCompleto,
        fecha: h.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en debug', error: error.message });
  }
});

module.exports = router;