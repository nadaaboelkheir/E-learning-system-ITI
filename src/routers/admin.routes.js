const express = require('express');

const {
	adminSignup,
	deleteUser,
	getAllTeachers,
	getAllStudents,
	getAllSubjects,
	getTeacherCourses,
	adminVerifyTeacher,
	getPendingTeachersAndCourses,
	adminVerifyCourse,
	deletePendingCourse,
} = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const { adminLevelRouter } = require('./level.routes');
const {adminEventRouter} = require('./event.routes');
const {adminQuizRouter} = require('./quiz.routes');

const router = express.Router();

router.post('/signup', adminSignup);
router.delete('/user/:userId', protectRoute, deleteUser);
router.get('/teachers', getAllTeachers);
router.get('/students', getAllStudents);
router.get('/subjects', getAllSubjects);
router.use('/level', protectRoute,adminLevelRouter);
router.use('/event', protectRoute,adminEventRouter);
router.get('/teacher-levels/:teacherId', getTeacherCourses);
router.patch('/verify-teacher/:teacherId', protectRoute, adminVerifyTeacher);
router.get(
	'/pending-teachers-courses',
	protectRoute,
	getPendingTeachersAndCourses,
);
router.patch('/verify-course/:courseId', protectRoute, adminVerifyCourse);
router.delete(
	'/pending-course/:courseId',
	protectRoute,
	deletePendingCourse,
);

router.use('/quiz', protectRoute, adminQuizRouter);

module.exports = router;
