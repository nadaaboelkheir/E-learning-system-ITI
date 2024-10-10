const { Admin, Wallet, Level, Student, Teacher, Event } = require('../models');
const bcrypt = require('bcryptjs');

exports.adminSignup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if the admin email already exists
		const existingAdmin = await Admin.findOne({ where: { email } });
		if (existingAdmin) {
			return res
				.status(400)
				.json({ message: 'البريد الالكتروني مستخدم بالفعل' });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Save admin to the database after email is sent
		const admin = await Admin.create({
			name,
			email,
			password: hashedPassword,
		});
		const wallet = await Wallet.create({
			balance: 0,
			walletableId: admin.id,
			walletableType: 'Admin',
		});

		await admin.update({ walletId: wallet.id });

		res.status(201).json({
			message: 'تم التسجيل بنجاح',
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.deleteUser = async (req, res) => {
	const { userId } = req.params;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}
		const student = await Student.findByPk(userId);
		const teacher = await Teacher.findByPk(userId);
		const user = student || teacher;
		if (!user) {
			return res.status(404).json({ error: 'المستخدم غير موجود' });
		}
		await user.destroy();
		res.status(200).json({ message: 'تم حذف المستخدم بنجاح' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllTeachers = async (req, res) => {
	try {
		const teachers = await Teacher.findAll({
			attributes: {
				exclude: ['walletId', 'updatedAt', 'refreshToken', 'password'],
			},
		});
		if (!teachers || teachers.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مدرسين' });
		}
		res.status(200).json({ count: teachers.length, data: teachers });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllStudents = async (req, res) => {
	try {
		const students = await Student.findAll({
			attributes: {
				exclude: [
					'walletId',
					'updatedAt',
					'refreshToken',
					'password',
					'isEmailVerified',
				],
			},
		});
		if (!students || students.length === 0) {
			return res.status(404).json({ error: 'لا يوجد طلاب' });
		}
		res.status(200).json({ count: students.length, data: students });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllSubjects = async (req, res) => {
	try {
		const specializations = await Teacher.findAll({
			attributes: ['specialization'],
			group: ['specialization'],
		});
		if (!specializations || specializations.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مواد دراسية' });
		}
		res.status(200).json({
			count: specializations.length,
			data: specializations,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};


