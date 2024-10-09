const { Student, Teacher, Admin, Wallet } = require('../models');
const { JWT_SECRET } = require('../utils/env');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail, generateOtp } = require('../utils/mailer');
const { generateTokenAndSetCookie } = require('../utils/generateToken');
const { Op } = require('sequelize');

const registerStudent = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		levelId,
		nationalID,
		phoneNumber,
		parentPhoneNumber,
	} = req.body;

	try {
		const existingStudent = await Student.findOne({
			where: {
				[Op.or]: [{ email }, { nationalID }],
			},
		});

		if (existingStudent) {
			return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const otp = generateOtp();
		const otpExpiry = Date.now() + 2 * 60 * 1000;

		const newStudent = await Student.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			levelId,
			nationalID,
			phoneNumber,
			parentPhoneNumber,
		});

		const wallet = await Wallet.create({
			balance: 0,
			walletableId: newStudent.id,
			walletableType: 'Student',
		});

		await newStudent.update({ walletId: wallet.id });

		await sendVerificationEmail(
			email,
			'Your OTP for verification',
			`Your OTP is ${otp}. It will expire in 2 minutes.`,
		);

		req.session.otp = otp;
		req.session.otpExpiry = otpExpiry;
		req.session.email = email;

		return res.status(201).json({
			message: 'برجاء التحقق من بريدك الالكتروني لاكمال التسجيل',
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const verifyOtp = async (req, res) => {
	try {
		const { email, otp: sessionOtp, otpExpiry } = req.session;
		const { otp } = req.body;

		if (!email) {
			return res
				.status(400)
				.json({ error: 'البريد الالكتروني غير موجود في الجلسة' });
		}

		const student = await Student.findOne({ where: { email } });
		if (!student) {
			return res.status(400).json({ message: 'المستخدم غير موجود' });
		}

		if (student.isEmailVerified) {
			return res
				.status(400)
				.json({ error: 'البريد الالكتروني تم التحقق منه بالفعل' });
		}

		// Check if OTP is expired
		if (Date.now() > otpExpiry) {
			return res.status(400).json({
				error: 'لقد انتهت صلاحية رمز التحقق. يرجى المحاولة مرة أخرى',
			});
		}

		// Compare the provided OTP with the session OTP
		if (String(otp) === String(sessionOtp)) {
			await Student.update(
				{ isEmailVerified: true },
				{ where: { email } },
			);
			req.session.otp = null; // Clear OTP from session
			req.session.otpExpiry = null; // Clear expiry from session

			return res
				.status(200)
				.json({ message: 'تم التحقق من بريدك الالكتروني بنجاح' });
		} else {
			return res
				.status(400)
				.json({ error: 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى' });
		}
	} catch (error) {
		return res.status(500).json({ message: 'حدث خطأ ما' });
	}
};

const resendOtp = async (req, res) => {
	try {
		const { email } = req.session;

		// Ensure the user has requested an OTP
		if (!email) {
			return res.status(400).json({
				error: 'برجاء التحقق من بريدك الالكتروني لاكمال التسجيل',
			});
		}

		// Find the student by email
		const student = await Student.findOne({ where: { email } });
		if (!student) {
			return res.status(400).json({ message: 'المستخدم غير موجود' });
		}

		// Generate new OTP and expiry
		const newOtp = generateOtp();
		const newOtpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

		// Update session with new OTP and expiry time
		req.session.otp = newOtp;
		req.session.otpExpiry = newOtpExpiry;

		// Send OTP via email
		await sendVerificationEmail(
			email,
			'Your OTP for verification (Resent)',
			`Your new OTP is ${newOtp}. It will expire in 2 minutes.`,
		);

		// Respond with success message
		return res.status(200).json({
			message: 'تم ارسال كود التحقق الجديد لبريدك الالكتروني',
		});
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'حدث خطأ ما عند اعادة ارسال الكود' });
	}
};

const createTeacher = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		phoneNumber,
		specialization,
		graduationYear,
		educationalQualification,
	} = req.body;

	try {
		const existingTeacher = await Teacher.findOne({
			where: { email },
		});

		if (existingTeacher) {
			return res.status(400).json({ error: 'المدرس موجود بالفعل' });
		}

		if (phoneNumber) {
			const existingTeacher = await Teacher.findOne({
				where: { phoneNumber },
			});
			if (existingTeacher) {
				return res
					.status(400)
					.json({ error: 'رقم الهاتف مستخدم بالفعل' });
			}
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newTeacher = await Teacher.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			phoneNumber,
			specialization,
			graduationYear,
			educationalQualification,
		});
		const wallet = await Wallet.create({
			balance: 0,
			walletableId: newTeacher.id,
			walletableType: 'Teacher',
		});

		await newTeacher.update({ walletId: wallet.id });

		return res.status(201).json({
			message:
				'تم تسجيل المدرس بنجاح في انتظار موافقة المسئول علي الانضمام للمنصة',
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const userLogin = async (req, res) => {
	const { email, password } = req.body;
	try {
		const student = await Student.findOne({
			where: { email },
		});
		if (student?.isEmailVerified === false) {
			return res.status(400).json({
				error: 'برجاء التحقق من بريدك الالكتروني لاكمال التسجيل',
			});
		}
		const teacher = await Teacher.findOne({
			where: { email },
		});
		if (teacher?.isEmailVerified === false) {
			return res.status(400).json({
				error: 'برجاء انتظار موافقة المسئول علي انضمامك للمنصة',
			});
		}
		const admin = await Admin.findOne({ where: { email } });

		const user = student || teacher || admin;

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res
				.status(401)
				.json({ error: 'خطأ في البريد الالكتروني او كلمة المرور' });
		}

		const role = user.role;
		await generateTokenAndSetCookie(user.id, role, res);
		const accessToken = jwt.sign({ id: user.id, role }, JWT_SECRET, {
			expiresIn: '1h',
		});
		return res
			.status(200)
			.json({ message: 'تم تسجيل الدخول بنجاح', accessToken });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const logout = async (req, res) => {
	res.clearCookie('access-token');
	res.clearCookie('refresh-token');
	res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
};

module.exports = {
	registerStudent,
	userLogin,
	createTeacher,
	logout,
	verifyOtp,
	resendOtp,
};
