const express = require('express');

const {
	getAllUsers,
	getUserById,
	getCurrentUser,
	updateUserProfile,
} = require('../controllers/user.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.get('/', getAllUsers);
router.get('/user/:id', getUserById);
router.get('/current-user', protectRoute, getCurrentUser);
router.patch('/update-user-profile', protectRoute, updateUserProfile);

module.exports = router;
