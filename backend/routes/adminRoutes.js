const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/profile', requireAdmin, adminController.profile);
router.patch('/password', requireAdmin, adminController.changePassword);
router.get('/stats', requireAdmin, adminController.stats);
router.get('/departments', requireAdmin, adminController.listDepartments);
router.get('/doctors', requireAdmin, adminController.listDoctors);
router.get('/patients', requireAdmin, adminController.listPatients);
router.get('/announcements', requireAdmin, adminController.listAnnouncements);
router.post('/announcements', requireAdmin, adminController.createAnnouncement);
router.get('/schedules', requireAdmin, adminController.listSchedules);
router.post('/schedules', requireAdmin, adminController.createSchedule);
router.get('/appointments', requireAdmin, adminController.listAppointments);
router.get('/visits', requireAdmin, adminController.listVisits);
router.get('/hospitalizations', requireAdmin, adminController.listHospitalizations);

module.exports = router;
