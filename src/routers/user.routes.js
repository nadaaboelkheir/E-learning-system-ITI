const express = require('express');
const {
	getAllUsers,
	getUserById,
	getCurrentUser,
	updateUserProfile,
	resetPassword,
	forgetPassword,
	resetPasswordToken,
	deleteUser,
	getTeachers,
} = require('../controllers/user.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const { userAuthRouter } = require('./auth.routes');
const { userCourseRouter } = require('./course.routes');
const { userEventRouter } = require('./event.routes');
const { userLevelRouter } = require('./level.routes');
const { uploadSingleImage } = require('../services/multer.service');
const { userReviewsRouter } = require('./review.routes');
const router = express.Router();
// User routes
router.use('/auth', userAuthRouter);
router.use('/courses', userCourseRouter);
router.use('/events', userEventRouter);
router.use('/levels', userLevelRouter);
router.use('/review', userReviewsRouter);
router.get('/current', protectRoute, getCurrentUser);
router.get('/teachers', getTeachers);
router.get('/:userId', getUserById);
router.get('/', getAllUsers);
router.patch('/profile', uploadSingleImage, protectRoute, updateUserProfile);
router.post('/reset-password', protectRoute, resetPassword);
router.post('/forget-password', forgetPassword);
router.post('/reset-password-token', resetPasswordToken);
router.delete('/:userId', protectRoute, deleteUser);

module.exports = router;
