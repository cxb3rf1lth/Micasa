const express = require('express');
const router = express.Router();
const {
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment
} = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { validateAppointment, validateId } = require('../middleware/validation');

router.route('/')
  .get(protect, getAppointments)
  .post(protect, validateAppointment, createAppointment);

router.route('/:id')
  .put(protect, validateId, validateAppointment, updateAppointment)
  .delete(protect, validateId, deleteAppointment);

module.exports = router;
