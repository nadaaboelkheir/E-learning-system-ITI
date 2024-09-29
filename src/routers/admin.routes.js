const express = require('express');

const {
	adminSignup,
	adminCreateLevel,
	adminDeleteUser,
} = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/signup', adminSignup);
router.post('/create-level', protectRoute, adminCreateLevel);
router.delete('/delete-user/:userId', protectRoute, adminDeleteUser);

module.exports = router;
