const express = require('express');
const {
	chargeStudentWallet,
	storeTransactionDetailsAndUpdateWallet,
	getStudentTransactions,
	getStudentWallet,
	buyCourseWithWallet,
	getStudentCourses,
	reviewEnrolledCourseByStudent,
	getReviewsMadeByStudent,
	getCourseReviews,
	takeQuiz,
	getStudentQuizzes,
	calculateStudentEvaluation,
	getCourseRating,
	getTeacherRatingFromCourses,
	getStudentsForParent,
	getStudents,
	getTeachers,
} = require('../controllers/payment.controller');

const router = express.Router();

router.post('/charge', chargeStudentWallet);

router.post('/transaction', storeTransactionDetailsAndUpdateWallet);

router.get('/transactions/:studentId', getStudentTransactions);

router.get('/wallet/:studentId', getStudentWallet);

router.post('/buy-course', buyCourseWithWallet);

router.get('/courses/:studentId', getStudentCourses);

router.post('/review', reviewEnrolledCourseByStudent);

router.get('/reviews/:studentId', getReviewsMadeByStudent);

router.get('/course-reviews/:courseId', getCourseReviews);

router.post('/take-quiz', takeQuiz);

router.get('/quizzes/:studentId', getStudentQuizzes);

router.get('/evaluation/:studentId', calculateStudentEvaluation);

router.get('/course-rating/:courseId', getCourseRating);

router.get('/teacher-rating/:teacherId', getTeacherRatingFromCourses);

router.get('/students-for-parent/:parentPhoneNumber', getStudentsForParent);

router.get('/students', getStudents);
router.get('/teachers', getTeachers);

module.exports = router;
