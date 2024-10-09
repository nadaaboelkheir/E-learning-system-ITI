const express = require('express');
const {
	registerStudent,
	userLogin,
	createTeacher,
	logout,
	verifyOtp,
	resendOtp,
} = require('../controllers/auth.controller');
const studentValidationRules = require('../validations/student.vc');
const validate = require('../middlewares/validators.mw');
const teacherValidationRules = require('../validations/teacher.vc');

const router = express.Router();

router.post(
	'/create-student',
	studentValidationRules(),
	validate,
	registerStudent,
);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/login-user', userLogin);
router.post(
	'/create-teacher',
	teacherValidationRules(),
	validate,
	createTeacher,
);
router.post('/logout', logout);

module.exports = router;
