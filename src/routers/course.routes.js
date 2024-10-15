const express = require('express');
const {
	createCourseWithSections,
	updateCourseWithSections,
	deleteCourse,
	getTeacherCourses,
	getCourseDetails,
	getAllCourses,
	getStudentsInCourse,
	buyCourseWithWallet,
	getStudentEnrolledCourses,
	getCertificateForCourse,
	getTeacherSections,
	deleteLesson,
	deleteSection,
	getSectionsForCourse,
	getSectionsForCourseById,
	createLesson,
	updateLesson,
} = require('../controllers/course.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const courseValidationRules = require('../validations/course.vc');
const validate = require('../middlewares/validators.mw');
const {
	uploadSingleImage,
	uploadFiles,
} = require('../services/multer.service');
const teacherCourseRouter = express.Router();

teacherCourseRouter.post(
	'/with-sections',
	uploadSingleImage,
	courseValidationRules(),
	validate,
	protectRoute,
	createCourseWithSections,
);

teacherCourseRouter.get(
	'/sections/:courseId',
	protectRoute,
	getSectionsForCourse,
);
teacherCourseRouter.get(
	'/section/:sectionId',
	protectRoute,
	getSectionsForCourseById,
);

teacherCourseRouter.post(
	'/section/lesson/:sectionId',
	uploadFiles,
	protectRoute,
	createLesson,
);
teacherCourseRouter.patch(
	'/:courseId',
	uploadSingleImage,
	protectRoute,
	updateCourseWithSections,
);
teacherCourseRouter.delete('/:courseId', protectRoute, deleteCourse);

teacherCourseRouter.delete('/lesson/:lessonId', protectRoute, deleteLesson);
teacherCourseRouter.patch(
	'/lesson/:lessonId',
	uploadFiles,
	protectRoute,
	updateLesson,
);
teacherCourseRouter.delete('/section/:sectionId', protectRoute, deleteSection);

const userCourseRouter = express.Router();
userCourseRouter.get('/teacher-courses/:teacherId', getTeacherCourses);
userCourseRouter.get('/teacher-sections', protectRoute, getTeacherSections);
userCourseRouter.get('/teacher/courses', protectRoute, getTeacherCourses);
userCourseRouter.get('/details/:id', getCourseDetails);
userCourseRouter.get('/all-courses', getAllCourses);
const adminCourseRouter = express.Router();
adminCourseRouter.get('/students-in-course/:courseId', getStudentsInCourse);

// student
const studentCoursesRouter = express.Router();
studentCoursesRouter
	.post('/buy-course', buyCourseWithWallet)
	.get('/enrolled-courses/:studentId', getStudentEnrolledCourses)
	.get('/enrolled/courses', protectRoute, getStudentEnrolledCourses)
	.get('/certificate/:studentId/:courseId', getCertificateForCourse);
module.exports = {
	studentCoursesRouter,
	userCourseRouter,
	teacherCourseRouter,
	adminCourseRouter,
};
