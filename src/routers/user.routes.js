const express = require('express');

const {
	getAllUsers,
	getUserById,
	getCurrentUser,
	updateUserProfile,
	resetPassword,
	forgetPassword,
} = require('../controllers/user.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const { userAuthRouter } = require('./auth.routes');
const { userCourseRouter } = require('./course.routes');
const { userEventRouter } = require('./event.routes');
const { userLevelRouter } = require('./level.routes');
const router = express.Router();

router.get('/current', protectRoute, getCurrentUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.patch('/profile', protectRoute, updateUserProfile);
router.post('/reset-password', protectRoute, resetPassword);
router.post('/forget-password', forgetPassword);

// User routes
router.use('/auth', userAuthRouter);
router.use('/courses', userCourseRouter);
router.use('/events', userEventRouter);
router.use('/levels/all', userLevelRouter);
module.exports = router;
