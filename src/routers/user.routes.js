const express = require('express');

const {
	getAllUsers,
	getUserById,
	getCurrentUser,
	updateUserProfile,
	getStudentByNationalId,
	resetPassword,
	forgetPassword,
} = require('../controllers/user.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.get('/current-user', protectRoute, getCurrentUser);
router.get('/:id', getUserById);
router.get('/', getAllUsers);
router.patch('/update-user-profile', protectRoute, updateUserProfile);
router.get('/student/:nationalId', getStudentByNationalId);
router.post('/reset-password', protectRoute, resetPassword);
router.post('/forget-password', forgetPassword);

module.exports = router;
