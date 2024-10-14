const express = require('express');
const {
	getAllUsers,
	getUserById,
	getCurrentUser,
	updateUserProfile,
	resetPassword,
	forgetPassword,
	resetPasswordToken,
} = require('../controllers/user.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const { userAuthRouter } = require('./auth.routes');
const { userCourseRouter } = require('./course.routes');
const { userEventRouter } = require('./event.routes');
const { userLevelRouter } = require('./level.routes');
const router = express.Router();
// User routes
router.use('/auth', userAuthRouter);
router.use('/courses', userCourseRouter);
router.use('/events', userEventRouter);
router.use('/levels', userLevelRouter);
router.get('/current', protectRoute, getCurrentUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.patch('/profile', protectRoute, updateUserProfile);
router.post('/reset-password', protectRoute, resetPassword);
router.post('/forget-password', forgetPassword);
router.post('/reset-password-token', resetPasswordToken);

module.exports = router;
