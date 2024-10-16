const express = require('express');
const {
	getTeacherRatingFromCourses,
	reviewEnrolledCourseByStudent,
	deleteReview,
	updateReview,
	getReviewsMadeByStudent,
} = require('../controllers/review.controller');
const { protectRoute, authorizeStudent } = require('../middlewares/auth.mw');

const studentReviewsRouter = express.Router();

studentReviewsRouter.post(
	'/',
	protectRoute,
	authorizeStudent,
	reviewEnrolledCourseByStudent,
);
studentReviewsRouter.delete(
	'/:reviewId',
	protectRoute,
	authorizeStudent,
	deleteReview,
);
studentReviewsRouter.patch(
	'/:reviewId',
	protectRoute,
	authorizeStudent,
	updateReview,
);
studentReviewsRouter.get(
	'/:studentId',
	protectRoute,
	authorizeStudent,
	getReviewsMadeByStudent,
);

module.exports = { studentReviewsRouter };
