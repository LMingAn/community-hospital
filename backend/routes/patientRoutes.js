const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { requirePatient } = require('../middleware/auth');

router.get('/today-doctors', requirePatient, patientController.todayDoctors);
router.post('/appointments', requirePatient, patientController.createAppointment);
router.patch('/appointments/:id/cancel', requirePatient, patientController.cancelAppointment);
router.get('/appointments', requirePatient, patientController.myAppointments);
router.get('/visits', requirePatient, patientController.myVisits);
router.get('/hospitalizations', requirePatient, patientController.myHospitalizations);
router.post('/recharge', requirePatient, patientController.recharge);

module.exports = router;
