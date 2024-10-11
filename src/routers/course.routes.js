const express = require('express');

const {
	createFullCourse,
	updateCourse,
	deleteCourse,
	getTeacherCourses,
	getCourseDetails,
	getAllCourses,
	getStudentsInCourse,
	buyCourseWithWallet,
	getStudentEnrolledCourses,
} = require('../controllers/course.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const courseValidationRules = require('../validations/course.vc');
const validate = require('../middlewares/validators.mw');
const router= express.Router();
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
const adminCourseRouter = express.Router();
adminCourseRouter.get('/students-in-course/:courseId', getStudentsInCourse);


// student
const studentCoursesRouter = express.Router();
studentCoursesRouter
	.post('/buy-course', buyCourseWithWallet)
	.get('/enrolled-courses/:studentId', getStudentEnrolledCourses);

module.exports = {
	studentCoursesRouter,
	userCourseRouter,
	teacherCourseRouter,
	adminCourseRouter
};
