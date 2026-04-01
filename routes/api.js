const express = require('express');
const controller = require('../controllers/apiController');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/session', controller.getSessionStatus);
router.get('/departments', controller.getDepartments);
router.get('/doctors', controller.getDoctors);
router.get('/slots/:doctorId', controller.getDoctorSlots);
router.post('/triage', controller.postTriage);
router.post('/appointments', controller.createAppointment);
router.get('/appointments', controller.queryAppointmentsByPhone);
router.post('/admin/login', controller.adminLogin);
router.post('/admin/logout', controller.adminLogout);
router.get('/admin/stats', requireAdmin, controller.getAdminStats);
router.get('/admin/appointments', requireAdmin, controller.getAllAppointments);
router.put('/admin/appointments/:id/status', requireAdmin, controller.updateAppointmentStatus);

module.exports = router;
