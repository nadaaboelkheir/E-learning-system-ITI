const express = require('express');

const {
	adminSignup,
	adminCreateLevel,
	adminDeleteUser,
	getAllTeachers,
	getAllStudents,
	getAllSubjects,
	adminAddNewEvent,
	adminGetEvents,
	getTeacherCourses,
	adminVerifyTeacher,
	getPendingTeachersAndCourses,
} = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/create-level', protectRoute, adminCreateLevel);
router.delete('/delete-user/:userId', protectRoute, adminDeleteUser);
router.get('/get-teachers', getAllTeachers);
router.get('/get-students', getAllStudents);
router.get('/get-subjects', getAllSubjects);
router.post('/add-new-event', protectRoute, adminAddNewEvent);
router.get('/get-events', adminGetEvents);
router.get('/get-teacher-levels/:teacherId', getTeacherCourses);
router.patch('/verify-teacher/:teacherId', protectRoute, adminVerifyTeacher);
router.get('/get-pending-teachers', protectRoute, getPendingTeachersAndCourses);

module.exports = router;
