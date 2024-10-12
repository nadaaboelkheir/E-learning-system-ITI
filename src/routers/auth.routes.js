const express = require('express');
const {
	registerStudent,
	userLogin,
	createTeacher,
	logout,
	verifyOtp,
	resendOtp,
	getActiveSessions,
} = require('../controllers/auth.controller');
const studentValidationRules = require('../validations/student.vc');
const validate = require('../middlewares/validators.mw');
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
userAuthRouter.post('/active-sessions', getActiveSessions);
userAuthRouter.post('/logout', logout);

const teacherAuthRouter = express.Router();

teacherAuthRouter.post(
	'/signup',
	teacherValidationRules(),
	validate,
	createTeacher,
);

module.exports = { userAuthRouter, studentAuthRouter, teacherAuthRouter };
