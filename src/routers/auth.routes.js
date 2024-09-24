const express = require('express');
const {
	registerStudent,
	userLogin,
	createTeacherByAdmin,
	logout,
} = require('../controllers/auth.controller');
const studentValidationRules = require('../validations/student.vc');
const validate = require('../middlewares/validators.mw');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post(
	'/create-student',
	studentValidationRules(),
	validate,
	registerStudent,
);
router.post('/login-user', userLogin);
router.post('/create-teacher', protectRoute, createTeacherByAdmin);
router.post('/logout', logout);

module.exports = router;
