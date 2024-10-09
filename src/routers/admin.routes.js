const express = require('express');

const {
	adminSignup,
	adminCreateLevelWithSubLevels,
	adminDeleteUser,
	getAllTeachers,
	getAllStudents,
	getAllSubjects,
	adminAddNewEvent,
	adminGetEvents,
} = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/create-level', protectRoute, adminCreateLevelWithSubLevels);
router.delete('/delete-user/:userId', protectRoute, adminDeleteUser);
router.get('/get-teachers', getAllTeachers);
router.get('/get-students', getAllStudents);
router.get('/get-subjects', getAllSubjects);
router.post('/add-new-event', protectRoute, adminAddNewEvent);
router.get('/get-events', adminGetEvents);

module.exports = router;
