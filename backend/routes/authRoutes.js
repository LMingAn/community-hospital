const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requirePatient, requireDoctor } = require('../middleware/auth');

router.post('/patient/register', authController.patientRegister);
router.post('/patient/login', authController.patientLogin);
router.post('/patient/logout', authController.patientLogout);
router.get('/patient/profile', requirePatient, authController.patientProfile);
router.put('/patient/profile', requirePatient, authController.patientUpdateProfile);
router.patch('/patient/password', requirePatient, authController.patientChangePassword);
router.post('/patient/reset-code', authController.patientResetCode);
router.post('/patient/reset-password', authController.patientResetPassword);

router.post('/doctor/register', authController.doctorRegister);
router.post('/doctor/login', authController.doctorLogin);
router.post('/doctor/logout', authController.doctorLogout);
router.get('/doctor/profile', requireDoctor, authController.doctorProfile);
router.put('/doctor/profile', requireDoctor, authController.doctorUpdateProfile);
router.patch('/doctor/password', requireDoctor, authController.doctorChangePassword);
router.post('/doctor/reset-code', authController.doctorResetCode);
router.post('/doctor/reset-password', authController.doctorResetPassword);

router.post('/admin/login', authController.adminLogin);
router.post('/admin/logout', authController.adminLogout);
router.get('/admin/check', authController.adminCheck);
router.post('/admin/reset-code', authController.adminResetCode);
router.post('/admin/reset-password', authController.adminResetPassword);

module.exports = router;
