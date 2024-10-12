const { Student, Teacher, Admin, Wallet, Level, Course } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getCurrentUser = async (req, res) => {
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;
	try {
		let user =
			(await Student.findByPk(userId, {
				include: {
					model: Wallet,
					as: 'wallet',
					attributes: ['id', 'balance'],
				},
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
		if (!user || user === null) {
			return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
		}
		let responseData;
		if (user.role === 'admin') {
			responseData = {
				id: user.id,
				name: user.name,
				email: user.email,
				picture: user.picture,
				walletId: user.walletId,
				role: user.role,
				walletBalance: user.wallet.balance,
			};
		} else if (user.role === 'student') {
			responseData = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				picture: user.picture,
				level: user.levelId,
				levelTitle: user.level?.title,
				nationalId: user.nationalID,
				phoneNumber: user.phoneNumber,
				parentPhoneNumber: user.parentPhoneNumber,
				walletId: user.walletId,
				role: user.role,
				walletBalance: user.wallet.balance,
			};
		} else if (user.role === 'teacher') {
			responseData = {
				id: user.id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				phoneNumber: user.phoneNumber,
				walletId: user.walletId,
				specialization: user.specialization,
				picture: user.picture,
				graduationYear: user.graduationYear,
				educationalQualification: user.educationalQualification,
				role: user.role,
				walletBalance: user.wallet.balance,
			};
		}
		return res.status(200).json({ data: responseData });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.updateUserProfile = async (req, res) => {
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;
	try {
		const user =
			(await Student.findByPk(userId)) ||
			(await Teacher.findByPk(userId)) ||
			(await Admin.findByPk(userId));
		if (!user) {
			return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
		}
		if (req.body.password) {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			req.body.password = hashedPassword;
		}
		const updatedUser = await user.update(req.body);
		return res.status(200).json({
			data: updatedUser,
			message: 'تم تحديث الملف الشخصي بنجاح',
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllUsers = async (req, res) => {
	try {
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
	} catch (error) {
		console.error('Error fetching users:', error);
		throw new Error('Failed to retrieve users.');
	}
};

exports.getUserById = async (req, res) => {
	const { id } = req.params;
	try {
		// Search in admins
		const admin = await Admin.findOne({
			where: { id },
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

		// Search in teachers
		const teacher = await Teacher.findOne({
			where: { id },
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

		// Search in students
		const student = await Student.findOne({
			where: { id },
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

		// If no user is found in any of the tables
		return res.status(404).json({ message: 'User not found.' });
	} catch (error) {
		console.error('Error fetching user by ID:', error);
		return res.status(500).json({ message: 'Failed to retrieve user.' });
	}
};

exports.resetPassword = async (req, res) => {
	const { oldPassword, newPassword } = req.body;
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;

	try {
		const user =
			(await Student.findByPk(userId)) ||
			(await Teacher.findByPk(userId)) ||
			(await Admin.findByPk(userId));
		if (!user) {
			return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
		}
		const isMatch = await bcrypt.compare(oldPassword, user.password);
		if (!isMatch) {
			return res
				.status(401)
				.json({ error: 'كلمة المرور القديمة غير صحيحة' });
		}
		const hashedPassword = await bcrypt.hash(newPassword, 10);
		await user.update({ password: hashedPassword });
		return res.status(200).json({ message: 'تم تغيير كلمة المرور بنجاح' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.forgetPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user =
			(await Student.findOne({ where: { email } })) ||
			(await Teacher.findOne({ where: { email } })) ||
			(await Admin.findOne({ where: { email } }));
		if (!user) {
			return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
		}
		const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			expiresIn: '1h',
		});
		const url = `http://localhost:3000/reset-password?token=${token}`;
		sendEmail(user.email, 'Reset Password', url);
		return res
			.status(200)
			.json({ message: 'تم ارسال رابط استعادة كلمة المرور بنجاح' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};
