const { Admin, Level, Student, Teacher } = require('../models');
const bcrypt = require('bcryptjs');

const adminSignup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if the admin email already exists
		const existingAdmin = await Admin.findOne({ where: { email } });
		if (existingAdmin) {
			return res.status(400).json({ message: 'Email already in use.' });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Save admin to the database after email is sent
		const admin = await Admin.create({
			name,
			email,
			password: hashedPassword,
		});

		res.status(201).json({
			message: 'Signup successful.',
			data: admin,
		});
	} catch (error) {
		console.error('Error in signup:', error);
		res.status(500).json({ error: error.message });
	}
};

const adminCreateLevel = async (req, res) => {
	const { title } = req.body;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const existingLevel = await Level.findOne({ where: { title } });
		if (existingLevel) {
			return res.status(400).json({ error: 'المستوى موجود بالفعل' });
		}

		const level = await Level.create({ title });
		res.status(201).json({
			message: 'تم انشاء المستوى بنجاح',
			data: level,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const adminDeleteUser = async (req, res) => {
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

module.exports = { adminSignup, adminCreateLevel, adminDeleteUser };
