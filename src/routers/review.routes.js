const express = require('express');
const {
	getCourseReviews,
	getCourseRating,
	getTeacherRatingFromCourses,
	reviewEnrolledCourseByStudent,
	getReviewsMadeByStudent
} = require('../controllers/review.controller');

const router = express.Router();

router.get('/course-rating/:courseId', getCourseRating);
router.get('/teacher-rating/:teacherId', getTeacherRatingFromCourses);
router.get('/course/:courseId', getCourseReviews);
router.post('/', reviewEnrolledCourseByStudent);
router.get('/:studentId', getReviewsMadeByStudent);


module.exports = router;
