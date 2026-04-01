const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { requireDoctor } = require('../middleware/auth');

router.get('/announcements', requireDoctor, doctorController.announcements);
router.get('/schedules', requireDoctor, doctorController.mySchedules);
router.get('/appointments', requireDoctor, doctorController.myAppointments);
router.patch('/appointments/:id/call', requireDoctor, doctorController.callPatient);
router.post('/visits', requireDoctor, doctorController.saveVisit);

module.exports = router;
