const express = require('express');

const {
	createFullCourse,
	updateCourse,
	deleteCourse,
	getTeacherCourses,
	getCourseDetails,
	getAllCourses,
	getStudentsInCourse,
} = require('../controllers/course.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const courseValidationRules = require('../validations/course.vc');
const validate = require('../middlewares/validators.mw');

const router = express.Router();

router.post(
	'/create-full-course',
	courseValidationRules(),
	validate,
	protectRoute,
	createFullCourse,
);
router.patch('/update-course/:courseId', protectRoute, updateCourse);
router.delete('/delete-course/:id', protectRoute, deleteCourse);
router.get('/teacher-courses/:teacherId', getTeacherCourses);
router.get('/course-details/:id', getCourseDetails);
router.get('/all-courses', getAllCourses);
router.get('/students-in-course/:courseId', getStudentsInCourse);

module.exports = router;
