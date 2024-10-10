const express = require('express');
const {
	registerStudent,
	userLogin,
	createTeacherByAdmin,
	logout,
	verifyOtp,
	resendOtp,
} = require('../controllers/auth.controller');
const studentValidationRules = require('../validations/student.vc');
const validate = require('../middlewares/validators.mw');
const { protectRoute } = require('../middlewares/auth.mw');
const teacherValidationRules = require('../validations/teacher.vc');

const studentAuthRouter = express.Router();

studentAuthRouter.post(
	'/signup',
	studentValidationRules(),
	validate,
	registerStudent,
);
studentAuthRouter.post('/verify-otp', verifyOtp);
studentAuthRouter.post('/resend-otp', resendOtp);
const userAuthRouter = express.Router();

userAuthRouter.post('/login-user', userLogin);

const teacherAuthRouter = express.Router();

teacherAuthRouter.post(
	'/signup',
	teacherValidationRules(),
	validate,
	createTeacherByAdmin,
);
userAuthRouter.post('/logout', logout);

module.exports = { userAuthRouter, studentAuthRouter, teacherAuthRouter };
