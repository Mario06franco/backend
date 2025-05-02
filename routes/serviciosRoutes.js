const express = require('express');
const router = express.Router();
const serviciosController = require('../controllers/serviciosController');
const { check } = require('express-validator');

// Middleware de validación
const validarServicio = [
  check('nombre', 'El nombre es obligatorio').not().isEmpty(),
  check('precio', 'El precio debe ser un número válido').isNumeric(),
  check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
  check('duracion', 'La duración es obligatoria').not().isEmpty()
];

// /api/servicios
router.route('/')
  .get(serviciosController.obtenerServicios)
  .post(validarServicio, serviciosController.crearServicio);

// /api/servicios/:id
router.route('/:id')
  .get(serviciosController.obtenerServicio)
  .put(validarServicio, serviciosController.actualizarServicio)
  .delete(serviciosController.eliminarServicio);

module.exports = router;