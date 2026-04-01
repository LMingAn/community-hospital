const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/departments', publicController.getDepartments);
router.get('/doctors', publicController.getDoctors);
router.get('/schedules/:doctorId', publicController.getDoctorSchedules);
router.post('/triage', publicController.triage);
router.post('/appointments', publicController.createAppointment);
router.get('/appointments', publicController.queryAppointments);
router.get('/appointments/timeline/:appointmentNo', publicController.getAppointmentTimeline);
router.patch('/appointments/:id/cancel', publicController.cancelAppointment);

module.exports = router;
