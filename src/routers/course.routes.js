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
	getCertificateForCourse,
	getTeacherSections,
} = require('../controllers/course.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const courseValidationRules = require('../validations/course.vc');
const validate = require('../middlewares/validators.mw');
const { upload } = require('../services/multer.service');
const teacherCourseRouter = express.Router();

teacherCourseRouter.post(
	'/',
	upload,
	courseValidationRules(),
	validate,
	protectRoute,
	createFullCourse,
);
teacherCourseRouter.patch('/:courseId', upload, protectRoute, updateCourse);
teacherCourseRouter.delete('/:courseId', protectRoute, deleteCourse);

const userCourseRouter = express.Router();
userCourseRouter.get('/teacher-courses/:teacherId', getTeacherCourses);
userCourseRouter.get('/teacher-sections', protectRoute, getTeacherSections);
userCourseRouter.get('/details/:id', getCourseDetails);
userCourseRouter.get('/all-courses', getAllCourses);
const adminCourseRouter = express.Router();
adminCourseRouter.get('/students-in-course/:courseId', getStudentsInCourse);

// student
const studentCoursesRouter = express.Router();
studentCoursesRouter
	.post('/buy-course', buyCourseWithWallet)
	.get('/enrolled-courses/:studentId', getStudentEnrolledCourses)
	.get('/certificate/:studentId/:courseId', getCertificateForCourse);
module.exports = {
	studentCoursesRouter,
	userCourseRouter,
	teacherCourseRouter,
	adminCourseRouter,
};
