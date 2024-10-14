const {
	Student,
	Teacher,
	Admin,
	Wallet,
	Level,
	UserSessions,
} = require('../models');
const { JWT_SECRET } = require('../utils/env');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail, generateOtp } = require('../utils/mailer');
const { generateTokenAndSetCookie } = require('../utils/generateToken');
const { Op } = require('sequelize');
const { activeDeviceLimit } = require('../utils/helperFunctions');
const AsyncHandler = require('express-async-handler');

exports.registerStudent = AsyncHandler(async (req, res) => {
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

	const level = await Level.findOne({
		where: { id: levelId },
	});
	if (!level) {
		return res.status(404).json({ message: 'المستوى غير موجود' });
	}

	const existingStudent = await Student.findOne({
		where: {
			[Op.or]: [{ email }, { nationalID }],
		},
	});

	if (existingStudent) {
		return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const otp = generateOtp();
	const otpExpiry = Date.now() + 6 * 60 * 1000;

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
});

exports.verifyOtp = AsyncHandler(async (req, res) => {
	const { email, otp: sessionOtp, otpExpiry } = req.session;
	const { otp } = req.body;

	if (!email) {
		return res
			.status(400)
			.json({ message: 'البريد الالكتروني غير موجود في الجلسة' });
	}

	const student = await Student.findOne({ where: { email } });
	if (!student) {
		return res.status(400).json({ message: 'المستخدم غير موجود' });
	}

	if (student.isEmailVerified) {
		return res
			.status(400)
			.json({ message: 'البريد الالكتروني تم التحقق منه بالفعل' });
	}

	if (Date.now() > otpExpiry) {
		return res.status(400).json({
			message: 'لقد انتهت صلاحية رمز التحقق. يرجى المحاولة مرة أخرى',
		});
	}

	if (String(otp) === String(sessionOtp)) {
		await Student.update({ isEmailVerified: true }, { where: { email } });
		req.session.otp = null;
		req.session.otpExpiry = null;
		req.session.email = null;
		req.session.destroy((err) => {
			if (err) {
				return res.status(500).json({ message: 'حدث خطأ ما' });
			}
		});

		return res
			.status(200)
			.json({ message: 'تم التحقق من بريدك الالكتروني بنجاح' });
	} else {
		return res
			.status(400)
			.json({ message: 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى' });
	}
});

exports.resendOtp = AsyncHandler(async (req, res) => {
	const { email } = req.session;

	if (!email) {
		return res.status(400).json({
			message: 'برجاء التحقق من بريدك الالكتروني لاكمال التسجيل',
		});
	}

	const student = await Student.findOne({ where: { email } });
	if (!student) {
		return res.status(400).json({ message: 'المستخدم غير موجود' });
	}

	const newOtp = generateOtp();
	const newOtpExpiry = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes

	req.session.otp = newOtp;
	req.session.otpExpiry = newOtpExpiry;

	await sendVerificationEmail(
		email,
		'Your OTP for verification (Resent)',
		`Your new OTP is ${newOtp}. It will expire in 2 minutes.`,
	);

	return res.status(200).json({
		message: 'تم ارسال كود التحقق الجديد لبريدك الالكتروني',
	});
});

exports.signUpTeacher = AsyncHandler(async (req, res) => {
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

	const existingTeacher = await Teacher.findOne({
		where: { email },
	});
	const existUser = await Student.findOne({
		where: { email },
	});
	if (existingTeacher || existUser) {
		return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
	}

	if (phoneNumber) {
		const existingTeacher = await Teacher.findOne({
			where: { phoneNumber },
		});
		const existUser = await Student.findOne({
			where: { phoneNumber },
		});
		if (existingTeacher || existUser) {
			return res
				.status(400)
				.json({ message: 'رقم الهاتف مستخدم بالفعل' });
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
});

exports.userLogin = AsyncHandler(async (req, res) => {
	const { email, password } = req.body;

	const student = await Student.findOne({
		where: { email: email },
	});
	if (student?.isEmailVerified === false) {
		return res.status(400).json({
			message: 'برجاء التحقق من بريدك الالكتروني لاكمال التسجيل',
		});
	}
	const teacher = await Teacher.findOne({
		where: { email: email },
	});
	if (teacher?.isEmailVerified === false) {
		return res.status(400).json({
			message: 'برجاء انتظار موافقة المسئول علي انضمامك للمنصة',
		});
	}
	const admin = await Admin.findOne({ where: { email } });

	const user = student || teacher || admin;

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return res
			.status(401)
			.json({ message: 'خطأ في البريد الالكتروني او كلمة المرور' });
	}

	const role = user.role;
	const deviceInfo = req.headers['user-agent'];
	const userId = user.id;

	const accessToken = jwt.sign({ id: user.id, role }, JWT_SECRET, {
		expiresIn: '1h',
	});
	await generateTokenAndSetCookie(user.id, role, res);

	if (role === 'student') {
		const sessions = await UserSessions.findAll({ where: { userId } });
		const activeSessions = sessions.filter((session) => session.active);

		if (activeSessions.length >= activeDeviceLimit) {
			return res.status(403).json({
				message: 'You cannot use more than 3 devices at the same time',
			});
		}

		const existingSession = await UserSessions.findOne({
			where: { userId, deviceInfo },
		});

		if (existingSession) {
			await existingSession.update({ active: true });
		} else {
			await UserSessions.create({
				userId,
				deviceInfo,
				active: true,
			});
		}
	}

	return res
		.status(200)
		.json({ message: 'تم تسجيل الدخول بنجاح', role, accessToken });
});

exports.logout = AsyncHandler(async (req, res) => {
	res.clearCookie('access-token');
	res.clearCookie('refresh-token');
	res.status(200).json({ message: 'تم تسجيل الخروج بنجاح' });
});

exports.getActiveSessions = AsyncHandler(async (req, res) => {
	const activeSessions = await UserSessions.findAll({
		where: { active: true },
		include: [
			{
				model: Student,
				as: 'student',
				attributes: ['id', 'firstName', 'lastName', 'email'],
			},
		],
	});

	if (activeSessions.length === 0) {
		return res.status(404).json({ message: 'No active sessions found' });
	}

	return res.status(200).json(activeSessions);
});
