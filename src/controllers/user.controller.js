const { Student, Teacher, Admin } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const getCurrentUser = async (req, res) => {
	const userId = req.student?.id || req.teacher?.id || req.admin?.id;
	try {
		let user =
			(await Student.findByPk(userId)) ||
			(await Teacher.findByPk(userId)) ||
			(await Admin.findByPk(userId));
		if (!user || user === null) {
			return res.status(404).json({ error: 'هذا المستخدم غير موجود' });
		}
		return res.status(200).json({ data: user });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const updateUserProfile = async (req, res) => {
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

const getAllUsers = async (req, res) => {
	try {
		const admins = await Admin.findAll({
			attributes: ['id', 'name', 'email', 'role'],
		});
		const teachers = await Teacher.findAll({
			attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
		});
		const students = await Student.findAll({
			attributes: ['id', 'firstName', 'lastName', 'email', 'role'],
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
			})),
			...students.map((student) => ({
				id: student.id,
				firstName: student.firstName,
				lastName: student.lastName,
				email: student.email,
				role: student.role,
			})),
		];

		return res.status(200).json(allUsers);
	} catch (error) {
		console.error('Error fetching users:', error);
		throw new Error('Failed to retrieve users.');
	}
};

const getUserById = async (req, res) => {
	const { id } = req.params;
	try {
		// Search in admins
		const admin = await Admin.findOne({ where: { id } });
		if (admin) {
			const {
				password,
				createdAt,
				updatedAt,
				refreshToken,
				...safeAdmin
			} = admin.dataValues;
			return res.status(200).json(safeAdmin);
		}

		// Search in teachers
		const teacher = await Teacher.findOne({ where: { id } });
		if (teacher) {
			const {
				password,
				createdAt,
				updatedAt,
				refreshToken,
				...safeTeacher
			} = teacher.dataValues;
			return res.status(200).json(safeTeacher);
		}

		// Search in students
		const student = await Student.findOne({ where: { id } });
		if (student) {
			const {
				emailVerified,
				password,
				walletId,
				createdAt,
				updatedAt,
				refreshToken,
				...safeStudent
			} = student.dataValues;
			return res.status(200).json(safeStudent);
		}

		// If no user is found in any of the tables
		return res.status(404).json({ message: 'User not found.' });
	} catch (error) {
		console.error('Error fetching user by ID:', error);
		throw new Error('Failed to retrieve user.');
	}
};

const getStudentByNationalId = async (req, res) => {
	const { nationalId } = req.params;
	try {
		const student = await Student.findOne({ where: { nationalId } });
		if (student) {
			const {
				password,
				createdAt,
				updatedAt,
				refreshToken,
				...safeStudent
			} = student.dataValues;
			return res.status(200).json(safeStudent);
		}
		return res.status(404).json({ message: 'هذا الطالب غير موجود' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const resetPassword = async (req, res) => {
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

const forgetPassword = async (req, res) => {
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

module.exports = {
	updateUserProfile,
	getCurrentUser,
	getAllUsers,
	getUserById,
	getStudentByNationalId,
	resetPassword,
	forgetPassword,
};
