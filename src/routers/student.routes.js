const express = require('express');
const {
	getStudentsForParent,
	calculateStudentEvaluation,
	getStudentByNationalId,
} = require('../controllers/student.controller');
const { studentAuthRouter } = require('./auth.routes');
const walletRoutes = require('./wallet.routes');
const { studentCoursesRouter } = require('./course.routes');
const { studentQuizRouter } = require('./quiz.routes');
const { studentReviewsRouter } = require('./review.routes');
const router = express.Router();
router.use('/auth', studentAuthRouter);
router.use('/wallet', walletRoutes);
router.use('/quiz', studentQuizRouter);
router.use('/course', studentCoursesRouter);
router.use('/review', studentReviewsRouter);
router.get('/evaluation/:studentId', calculateStudentEvaluation);

router.get('/nationalId/:nationalId', getStudentByNationalId);
router.get('/students-for-parent/:parentPhoneNumber', getStudentsForParent);

module.exports = router;
