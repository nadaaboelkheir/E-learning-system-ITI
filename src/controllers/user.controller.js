const {
	Student,
	Teacher,
	Admin,
	Wallet,
	Level,
	Course,
	Review,
} = require('../models');
const bcrypt = require('bcryptjs');
const AsyncHandler = require('express-async-handler');
const { sendVerificationEmail } = require('../utils/mailer');
const { deleteFilesFromCloudinary } = require('../services/multer.service');
const {
	setTemporaryData,
	getTemporaryData,
	clearTemporaryData,
} = require('../utils/helperFunctions');
const crypto = require('crypto');

exports.getCurrentUser = AsyncHandler(async (req, res) => {
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;

	let user =
		(await Student.findByPk(userId, {
			include: [
				{ model: Wallet, as: 'wallet', attributes: ['id', 'balance'] },
				{ model: Level, as: 'level', attributes: ['id', 'title'] },
			],
		})) ||
		(await Teacher.findByPk(userId, {
			include: {
				model: Wallet,
				as: 'wallet',
				attributes: ['id', 'balance'],
			},
		})) ||
		(await Admin.findByPk(userId, {
			include: {
				model: Wallet,
				as: 'wallet',
				attributes: ['id', 'balance'],
			},
		}));

	if (!user) {
		return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
	}

	// Helper function to build response data based on the user role
	const buildResponse = async (user) => {
		let baseData = {
			id: user.id,
			email: user.email,
			picture: user.picture,
			role: user.role,
			walletId: user.wallet?.id || null,
			walletBalance: user.wallet?.balance || 0,
		};

		if (user.role === 'student') {
			return {
				...baseData,
				firstName: user.firstName,
				lastName: user.lastName,
				levelId: user.level?.id || null,
				levelTitle: user.level?.title || '',
				nationalId: user.nationalID,
				phoneNumber: user.phoneNumber,
				parentPhoneNumber: user.parentPhoneNumber,
			};
		}

		if (user.role === 'teacher') {
			return {
				...baseData,
				firstName: user.firstName,
				lastName: user.lastName,
				phoneNumber: user.phoneNumber,
				specialization: user.specialization,
				graduationYear: user.graduationYear,
				educationalQualification: user.educationalQualification,
			};
		}

		return {
			...baseData,
			name: user.name,
		};
	};

	const responseData = await buildResponse(user);
	return res.status(200).json({ data: responseData });
});

exports.updateUserProfile = AsyncHandler(async (req, res) => {
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;
	const user =
		(await Student.findByPk(userId)) ||
		(await Teacher.findByPk(userId)) ||
		(await Admin.findByPk(userId));
	if (!user) {
		return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
	}
	if (req.file) {
		if (user.picture) {
			await deleteFilesFromCloudinary('images', user.picture, 'image');
		}
		user.picture = req.file.path;
	}
	if (req.body.password) {
		const hashedPassword = await bcrypt.hash(req.body.password, 10);
		req.body.password = hashedPassword;
	}
	const updatedUser = await user.update({
		...req.body,
		picture: user.picture,
	});
	return res.status(200).json({
		data: updatedUser,
		message: 'تم تحديث الملف الشخصي بنجاح',
	});
});
exports.deleteUser = AsyncHandler(async (req, res) => {
	const { userId } = req.params;

	if (req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const student = await Student.findByPk(userId);
	const teacher = await Teacher.findByPk(userId);
	const user = student || teacher;
	if (!user) {
		return res.status(404).json({ message: 'المستخدم غير موجود' });
	}
	if (!user.isEmailVerified) {
		return res.status(401).json({ message: 'الحساب غير مفعل' });
	}
	let wallet;
	if (user.walletId) {
		wallet = await Wallet.findOne({
			where: {
				walletableId: user.id,
				walletableType: user instanceof Student ? 'Student' : 'Teacher',
			},
		});
		if (wallet) {
			await wallet.destroy();
		}
	}
	if (user.picture) {
		await deleteFilesFromCloudinary('images', user.picture, 'image');
	}

	await user.destroy();
	return res.status(200).json({ message: 'تم حذف المستخدم بنجاح' });
});

exports.getAllUsers = AsyncHandler(async (req, res) => {
	const admins = await Admin.findAll({
		attributes: ['id', 'name', 'email', 'role'],
	});
	const teachers = await Teacher.findAll({
		attributes: [
			'id',
			'firstName',
			'lastName',
			'email',
			'role',
			'isEmailVerified',
		],
	});
	const students = await Student.findAll({
		attributes: [
			'id',
			'firstName',
			'lastName',
			'email',
			'role',
			'isEmailVerified',
		],
	});

	const allUsers = [
		...admins.map((admin) => ({
			id: admin.id,
			name: admin.name,
			email: admin.email,
			role: admin.role,
		})),
		...teachers.map((teacher) => ({
			id: teacher.id,
			firstName: teacher.firstName,
			lastName: teacher.lastName,
			email: teacher.email,
			role: teacher.role,
			isEmailVerified: teacher.isEmailVerified,
		})),
		...students.map((student) => ({
			id: student.id,
			firstName: student.firstName,
			lastName: student.lastName,
			email: student.email,
			role: student.role,
			isEmailVerified: student.isEmailVerified,
		})),
	];

	return res.status(200).json(allUsers);
});

exports.getUserById = AsyncHandler(async (req, res) => {
	const { userId } = req.params;

	const admin = await Admin.findOne({
		where: { id: userId },
		include: {
			model: Wallet,
			as: 'wallet',
			attributes: ['balance'],
		},
	});
	if (admin) {
		const {
			password,
			createdAt,
			updatedAt,
			refreshToken,
			wallet,
			...safeAdmin
		} = admin.dataValues;
		return res.status(200).json({
			...safeAdmin,
			walletBalance: admin.wallet?.balance || 0,
		});
	}

	const teacher = await Teacher.findOne({
		where: { id: userId },
		include: {
			model: Wallet,
			as: 'wallet',
			attributes: ['balance'],
		},
	});
	if (teacher) {
		const {
			password,
			createdAt,
			updatedAt,
			refreshToken,
			wallet,
			...safeTeacher
		} = teacher.dataValues;
		return res.status(200).json({
			...safeTeacher,
			walletBalance: teacher.wallet?.balance || 0,
		});
	}

	const student = await Student.findOne({
		where: { id: userId },
		include: [
			{
				model: Wallet,
				as: 'wallet',
				attributes: ['balance'],
			},
			{
				model: Level,
				as: 'level',
				attributes: ['title'],
			},
			{
				model: Course,
				as: 'courses',
				attributes: ['title'],
				include: [
					{
						model: Teacher,
						as: 'teacher',
						attributes: ['firstName', 'lastName'],
					},
				],
				through: { attributes: [] },
			},
		],
	});
	if (student) {
		const {
			isEmailVerified,
			password,
			walletId,
			createdAt,
			updatedAt,
			refreshToken,
			wallet,
			level,
			courses,

			...safeStudent
		} = student.dataValues;
		const coursesWithTeachers = student.courses.map((course) => ({
			title: course.title,
			teacherName: course.teacher
				? `${course.teacher.firstName} ${course.teacher.lastName}`
				: 'No teacher assigned',
		}));
		return res.status(200).json({
			...safeStudent,
			walletBalance: student.wallet?.balance,
			levelTitle: student.level?.title,
			numberOfCourses: coursesWithTeachers.length,
			courses: coursesWithTeachers,
		});
	}

	return res.status(404).json({ message: 'هذا المستخدم غير موجود' });
});

exports.resetPassword = AsyncHandler(async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;

	const user =
		(await Student.findByPk(userId)) ||
		(await Teacher.findByPk(userId)) ||
		(await Admin.findByPk(userId));
	if (!user) {
		return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
	}
	const isMatch = await bcrypt.compare(oldPassword, user.password);
	if (!isMatch) {
		return res.status(401).json({ error: 'كلمة المرور القديمة غير صحيحة' });
	}
	const hashedPassword = await bcrypt.hash(newPassword, 10);
	await user.update({ password: hashedPassword });
	return res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
});

exports.forgetPassword = AsyncHandler(async (req, res) => {
	const { email } = req.body;

	const user =
		(await Student.findOne({ where: { email } })) ||
		(await Teacher.findOne({ where: { email } })) ||
		(await Admin.findOne({ where: { email } }));
	if (!user) {
		return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
	}

	const token = crypto.randomBytes(20).toString('hex');

	setTemporaryData(token, email);
	const resetLink = `http://yourapp.com/reset-password?token=${token}`;

	await sendVerificationEmail(
		email,
		'Password Reset Request',
		`You requested a password reset. Click the link to reset your password: ${resetLink}`,
	);

	return res.status(200).json({
		message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني',
	});
});

exports.resetPasswordToken = AsyncHandler(async (req, res) => {
	const { token } = req.query;
	const { newPassword } = req.body;

	const email = getTemporaryData(token);
	if (!email) {
		return res.status(400).json({
			message: 'رمز إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية',
		});
	}

	const user =
		(await Student.findOne({ where: { email } })) ||
		(await Teacher.findOne({ where: { email } })) ||
		(await Admin.findOne({ where: { email } }));
	if (!user) {
		return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
	}

	const hashedPassword = await bcrypt.hash(newPassword, 10);
	await user.update({ password: hashedPassword });

	clearTemporaryData(token);
	return res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
});
exports.getTeachers = AsyncHandler(async (req, res) => {
	const { page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const teachers = await Teacher.findAndCountAll({
		where: { isEmailVerified: true },
		limit: parseInt(limit),
		offset,
		attributes: [
			'id',
			'firstName',
			'lastName',
			'picture',
			'specialization',
		],
		include: {
			model: Course,
			as: 'courses',
			attributes: ['id', 'title'],
			include: {
				model: Level,
				as: 'level',
				attributes: ['id', 'title'],
			},
		},
	});

	if (teachers.length === 0) {
		return res.status(404).json({ message: 'لا يوجد مدرسين' });
	}

	const totalPages = Math.ceil(teachers.count / limit);

	res.status(200).json({
		currentPage: page,
		totalPages,
		totalTeachers: teachers.count,
		teachers: teachers.rows,
	});
});
