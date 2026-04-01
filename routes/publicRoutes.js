const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/announcements', publicController.getAnnouncements);
router.get('/departments', publicController.getDepartments);
router.get('/today-doctors', publicController.getTodayDoctors);
router.post('/triage', publicController.triage);

module.exports = router;
