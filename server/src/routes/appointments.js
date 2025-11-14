const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validators, validate } = require('../middleware/validators');

router.route('/')
  .get(protect, getAppointments)
  .post(protect, validators.appointment, validate, createAppointment);

router.route('/:id')
  .put(protect, validators.id, validate, updateAppointment)
  .delete(protect, validators.id, validate, deleteAppointment);

module.exports = router;
