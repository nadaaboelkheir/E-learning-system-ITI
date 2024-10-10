const express = require('express');

const {
	createFullCourse,
	updateCourse,
	deleteCourse,
	getTeacherCourses,
	getCourseDetails,
	getAllCourses,
	buyCourseWithWallet,
	getStudentEnrolledCourses,
} = require('../controllers/course.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const courseValidationRules = require('../validations/course.vc');
const validate = require('../middlewares/validators.mw');

const teacherCourseRouter = express.Router();

teacherCourseRouter.post(
	'/',
	courseValidationRules(),
	validate,
	protectRoute,
	createFullCourse,
);
teacherCourseRouter.patch('/:courseId', protectRoute, updateCourse);
teacherCourseRouter.delete('/:courseId', protectRoute, deleteCourse);

const userCourseRouter = express.Router();
userCourseRouter.get('/teacher-courses/:teacherId', getTeacherCourses);
userCourseRouter.get('/details/:id', getCourseDetails);
userCourseRouter.get('/all-courses', getAllCourses);

// student
const studentCoursesRouter = express.Router();
studentCoursesRouter
	.post('/buy-course', buyCourseWithWallet)
	.get('/enrolled-courses/:studentId', getStudentEnrolledCourses);

module.exports = {
	studentCoursesRouter,
	userCourseRouter,
	teacherCourseRouter,
};
