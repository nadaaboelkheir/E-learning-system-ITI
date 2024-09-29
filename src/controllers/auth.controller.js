const { Student, Teacher, Admin, Wallet } = require('../models');
const bcrypt = require('bcryptjs');
const sendVerificationEmail = require('../utils/mailer');
const { generateTokenAndSetCookie } = require('../utils/generateToken');

const registerStudent = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		level,
		nationalID,
		phoneNumber,
		parentPhoneNumber,
	} = req.body;

	try {
		const existingStudent = await Student.findOne({
			where: { email },
		});

		if (existingStudent) {
			return res.status(400).json({ error: 'المستخدم موجود بالفعل' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		// const verificationCode = Math.floor(100000 + Math.random() * 900000);
		const newStudent = await Student.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			level,
			nationalID,
			phoneNumber,
			parentPhoneNumber,
			//   verificationCode,
		});

		const wallet = await Wallet.create({
			balance: 0,
			walletableId: newStudent.id,
			walletableType: 'Student',
		});

		await newStudent.update({ walletId: wallet.id });

		// await sendVerificationEmail(studentEmail, verificationCode);
		return res.status(201).json({
			message: 'برجاء التحقق من بريدك الالكتروني  لاكمال التسجيل',
			data: newStudent,
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const createTeacherByAdmin = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password,
		levels,
		phoneNumber,
		specialization,
		graduationYear,
		educationalQualification,
	} = req.body;

	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const existingTeacher = await Teacher.findOne({
			where: { email },
		});

		if (existingTeacher) {
			return res.status(400).json({ error: 'المدرس موجود بالفعل' });
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newTeacher = await Teacher.create({
			firstName,
			lastName,
			email,
			password: hashedPassword,
			levels,
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
			message: 'تم تسجيل المدرس بنجاح',
			data: newTeacher,
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
		const teacher = await Teacher.findOne({
			where: { email },
		});
		const admin = await Admin.findOne({ where: { email } });

		const user = student || teacher || admin;

		if (!user || !(await bcrypt.compare(password, user.password))) {
			return res
				.status(401)
				.json({ error: 'خطأ في البريد الالكتروني او كلمة المرور' });
		}

		const role = user.role;
		await generateTokenAndSetCookie(user.id, role, res);
		return res.status(200).json({ message: 'تم تسجيل الدخول بنجاح' });
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
	createTeacherByAdmin,
	logout,
};
