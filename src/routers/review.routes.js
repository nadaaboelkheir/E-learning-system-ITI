const express = require('express');
const {
	getCourseReviews,
	getCourseRating,
	getTeacherRatingFromCourses,
	reviewEnrolledCourseByStudent,
	getReviewsMadeByStudent,
} = require('../controllers/review.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.get('/course-rating/:courseId', getCourseRating);
router.get('/teacher-rating/:teacherId', getTeacherRatingFromCourses);
router.get('/teacher/rating', protectRoute, getTeacherRatingFromCourses);
router.get('/course/:courseId', getCourseReviews);
router.post('/', reviewEnrolledCourseByStudent);
router.get('/:studentId', getReviewsMadeByStudent);

module.exports = router;
