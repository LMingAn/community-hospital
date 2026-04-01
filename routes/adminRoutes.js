const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/check', adminController.check);
router.get('/stats', requireAdmin, adminController.stats);
router.get('/schedules', requireAdmin, adminController.listSchedules);
router.patch('/appointments/:id/status', requireAdmin, adminController.updateAppointmentStatus);
router.patch('/schedules/:id/status', requireAdmin, adminController.updateScheduleStatus);

module.exports = router;
