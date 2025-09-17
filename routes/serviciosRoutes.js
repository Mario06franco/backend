const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/serviciosController');

// Rutas para servicios
router.post('/', servicioController.crearServicio);
router.get('/', servicioController.obtenerServicios);
router.get('/:id', servicioController.obtenerServicioPorId);
router.put('/:id', servicioController.actualizarServicio);
router.delete('/:id', servicioController.eliminarServicio);

module.exports = router;