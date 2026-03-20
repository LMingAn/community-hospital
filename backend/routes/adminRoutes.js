const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');

router.get('/profile', requireAdmin, adminController.profile);
router.patch('/password', requireAdmin, adminController.changePassword);
router.get('/stats', requireAdmin, adminController.stats);

router.get('/departments', requireAdmin, adminController.listDepartments);
router.post('/departments', requireAdmin, adminController.createDepartment);
router.put('/departments/:id', requireAdmin, adminController.updateDepartment);
router.delete('/departments/:id', requireAdmin, adminController.deleteDepartment);

router.get('/doctors', requireAdmin, adminController.listDoctors);
router.post('/doctors', requireAdmin, adminController.createDoctor);
router.put('/doctors/:id', requireAdmin, adminController.updateDoctor);
router.delete('/doctors/:id', requireAdmin, adminController.deleteDoctor);

router.get('/patients', requireAdmin, adminController.listPatients);
router.post('/patients', requireAdmin, adminController.createPatient);
router.put('/patients/:id', requireAdmin, adminController.updatePatient);
router.delete('/patients/:id', requireAdmin, adminController.deletePatient);

router.get('/announcements', requireAdmin, adminController.listAnnouncements);
router.post('/announcements', requireAdmin, adminController.createAnnouncement);
router.put('/announcements/:id', requireAdmin, adminController.updateAnnouncement);
router.delete('/announcements/:id', requireAdmin, adminController.deleteAnnouncement);

router.get('/schedules', requireAdmin, adminController.listSchedules);
router.post('/schedules', requireAdmin, adminController.createSchedule);
router.put('/schedules/:id', requireAdmin, adminController.updateSchedule);
router.delete('/schedules/:id', requireAdmin, adminController.deleteSchedule);

router.get('/appointments', requireAdmin, adminController.listAppointments);
router.post('/appointments', requireAdmin, adminController.createAppointment);
router.put('/appointments/:id', requireAdmin, adminController.updateAppointment);
router.delete('/appointments/:id', requireAdmin, adminController.deleteAppointment);

router.get('/visits', requireAdmin, adminController.listVisits);
router.post('/visits', requireAdmin, adminController.createVisit);
router.put('/visits/:id', requireAdmin, adminController.updateVisit);
router.delete('/visits/:id', requireAdmin, adminController.deleteVisit);

router.get('/hospitalizations', requireAdmin, adminController.listHospitalizations);
router.post('/hospitalizations', requireAdmin, adminController.createHospitalization);
router.put('/hospitalizations/:id', requireAdmin, adminController.updateHospitalization);
router.delete('/hospitalizations/:id', requireAdmin, adminController.deleteHospitalization);

module.exports = router;
