const {
	Admin,
	Wallet,
	Level,
	Student,
	Teacher,
	Event,
	Course,
} = require('../models');
const bcrypt = require('bcryptjs');

const adminSignup = async (req, res) => {
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

const adminVerifyTeacher = async (req, res) => {
	const { teacherId } = req.params;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}
		const teacher = await Teacher.findByPk(teacherId);
		if (!teacher) {
			return res.status(404).json({ error: 'المدرس غير موجود' });
		}
		await teacher.update({ isEmailVerified: true });
		res.status(200).json({ message: 'تم تفعيل المدرس بنجاح' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const adminVerifyCourse = async (req, res) => {
	const { courseId } = req.params;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}
		const course = await Course.findByPk(courseId);
		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}
		await course.update({ courseVerify: true });
		res.status(200).json({ message: 'تم تفعيل الدورة بنجاح' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getAllTeachers = async (req, res) => {
	try {
		const teachers = await Teacher.findAll({
			where: { isEmailVerified: true },
			include: {
				model: Level,
				as: 'level',
				attributes: ['title'],
			},
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
		if (!teachers || teachers.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مدرسين' });
		}
		res.status(200).json({ count: teachers.length, data: teachers });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getAllStudents = async (req, res) => {
	try {
		const students = await Student.findAll({
			where: { isEmailVerified: true },
			include: {
				model: Level,
				as: 'level',
				attributes: ['title'],
			},
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

const getAllSubjects = async (req, res) => {
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

const adminAddNewEvent = async (req, res) => {
	const { title, description, start, end, eventUrl } = req.body;
	const adminId = req.userId;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}
		const event = await Event.create({
			title,
			description,
			start,
			end,
			eventUrl,
			adminId,
		});
		res.status(201).json({
			message: 'تم انشاء الحدث بنجاح',
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const adminGetEvents = async (req, res) => {
	try {
		const events = await Event.findAll();
		if (!events || events.length === 0) {
			return res.status(404).json({ error: 'لا يوجد أحداث للعرض' });
		}
		res.status(200).json({ data: events });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getTeacherCourses = async (req, res) => {
	const { teacherId } = req.params;
	try {
		const teacher = await Teacher.findOne({ where: { id: teacherId } });
		if (!teacher) {
			return res.status(404).json({ error: 'المدرس غير موجود' });
		}
		const courses = await Course.findAll({
			where: { teacherId, courseVerify: true },
			include: [
				{
					model: Level,
					attributes: ['id', 'title'],
					as: 'level',
				},
			],
		});
		if (!courses || courses.length === 0) {
			return res.status(404).json({ error: 'لا يوجد دورات لهذا المدرس' });
		}
		return res.status(200).json({ count: courses.length, data: courses });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getPendingTeachersAndCourses = async (req, res) => {
	try {
		const teachers = await Teacher.findAll({
			where: { isEmailVerified: false },
			include: [
				{
					model: Level,
					attributes: ['id', 'title'],
					as: 'level',
				},
			],
		});
		const courses = await Course.findAll({
			where: { courseVerify: false },
			include: [
				{
					model: Level,
					attributes: ['id', 'title'],
					as: 'level',
				},
			],
		});
		if (!teachers || teachers.length === 0) {
			return res
				.status(404)
				.json({ error: 'لا يوجد مدرسين قيد المراجعة' });
		}
		if (!courses || courses.length === 0) {
			return res
				.status(404)
				.json({ error: 'لا يوجد دورات قيد المراجعة' });
		}
		res.status(200).json({
			teacherCount: teachers.length,
			teacherData: teachers,
			courseCount: courses.length,
			courseData: courses,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deletePendingCourse = async (req, res) => {
	const { courseId } = req.params;
	try {
		const course = await Course.findOne({
			where: { id: courseId, courseVerify: false },
		});
		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}
		await Course.destroy({ where: { id: courseId } });
		res.status(200).json({ message: 'تم حذف الدورة بنجاح' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	adminSignup,
	adminCreateLevel,
	adminDeleteUser,
	getAllTeachers,
	getAllStudents,
	getAllSubjects,
	adminAddNewEvent,
	adminGetEvents,
	getTeacherCourses,
	adminVerifyTeacher,
	getPendingTeachersAndCourses,
	adminVerifyCourse,
	deletePendingCourse,
};
