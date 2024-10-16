const express = require('express');
const {
	createCourseWithSections,
	updateCourseWithSections,
	deleteCourse,
	getTeacherCourses,
	getCourseDetailsById,
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
const {
	protectRoute,
	authorizeStudent,
	authorizeTeacher,
	authorizeTeacherOrAdmin,
} = require('../middlewares/auth.mw');
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
	authorizeTeacher,
	createCourseWithSections,
);

teacherCourseRouter.get(
	'/sections/:courseId',
	protectRoute,
	getSectionsForCourse,
);
teacherCourseRouter.patch(
	'/:courseId',
	uploadSingleImage,
	protectRoute,
	authorizeTeacher,
	updateCourseWithSections,
);
teacherCourseRouter.delete(
	'/:courseId',
	protectRoute,
	authorizeTeacherOrAdmin,
	deleteCourse,
);
teacherCourseRouter.get(
	'/section/:sectionId',
	protectRoute,
	getSectionsForCourseById,
);

teacherCourseRouter.delete(
	'/section/:sectionId',
	protectRoute,
	authorizeTeacher,
	deleteSection,
);
teacherCourseRouter.post(
	'/section/lesson/:sectionId',
	uploadFiles,
	protectRoute,
	authorizeTeacher,
	createLesson,
);

teacherCourseRouter.delete(
	'/lesson/:lessonId',
	protectRoute,
	authorizeTeacher,
	deleteLesson,
);
teacherCourseRouter.patch(
	'/lesson/:lessonId',
	uploadFiles,
	protectRoute,
	authorizeTeacher,
	updateLesson,
);

const userCourseRouter = express.Router();
userCourseRouter.get(
	'/teacher-courses/:teacherId?',
	protectRoute,
	authorizeTeacher,
	getTeacherCourses,
);
userCourseRouter.get(
	'/teacher-sections',
	protectRoute,
	authorizeTeacher,
	getTeacherSections,
);
userCourseRouter.get('/details/:courseId', getCourseDetailsById);
userCourseRouter.get('/all-courses', getAllCourses);

// admin
const adminCourseRouter = express.Router();
adminCourseRouter.get(
	'/students-in-course/:courseId',
	protectRoute,
	authorizeTeacherOrAdmin,
	getStudentsInCourse,
);

// student
const studentCoursesRouter = express.Router();
studentCoursesRouter
	.post('/buy-course', protectRoute, authorizeStudent, buyCourseWithWallet)
	.get(
		'/enrolled/courses',
		protectRoute,
		authorizeStudent,
		getStudentEnrolledCourses,
	)
	.get(
		'/certificate/:courseId',
		protectRoute,
		authorizeStudent,
		getCertificateForCourse,
	);

module.exports = {
	studentCoursesRouter,
	userCourseRouter,
	teacherCourseRouter,
	adminCourseRouter,
};
