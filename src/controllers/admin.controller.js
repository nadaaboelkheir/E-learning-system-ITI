const { Admin, Wallet, Level, Student, Teacher, Course } = require('../models');
const bcrypt = require('bcryptjs');
const { sendVerificationEmail } = require('../utils/mailer');

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

		return	res.status(201).json({
			message: 'تم التسجيل بنجاح',
		});
	} catch (error) {
		return	res.status(500).json({ error: error.message });
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
	return	res.status(200).json({ message: 'تم حذف المستخدم بنجاح' });
	} catch (error) {
		return	res.status(500).json({ error: error.message });
	}
};

exports.adminVerifyTeacher = async (req, res) => {
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
		const subject = 'تم التحقق من حسابك';
		const text =
			'مبروك! تم تفعيل حسابك من قبل الإدارة. يمكنك الآن تسجيل الدخول.';
		await sendVerificationEmail(teacher.email, subject, text);
	return	res.status(200).json({ message: 'تم تفعيل المدرس بنجاح' });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};

exports.adminDeletePendingTeacher = async (req, res) => {
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
		await teacher.destroy();
		sendVerificationEmail(
			teacher.email,
			'تم حذف حسابك',
			'تم حذف حسابك من قبل الإدارة',
		);
	return	res.status(200).json({ message: 'تم حذف المدرس بنجاح' });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};

exports.adminVerifyCourse = async (req, res) => {
	const { courseId } = req.params;

	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const course = await Course.findByPk(courseId, {
			include: [{ model: Teacher, as: 'teacher', attributes: ['email'] }], // Include the teacher's email
		});

		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}

		// Update the course verification status
		await course.update({ courseVerify: true });

		// Send a verification email to the teacher
		const teacherEmail = course.teacher.email; // Get the teacher's email
		const subject = 'تم الموافقة على دورتك';
		const text = `مبروك! تم تفعيل دورتك "${course.title}" من قبل الإدارة. يمكنك الآن الوصول إليها.`;
		await sendVerificationEmail(teacherEmail, subject, text);

	return	res.status(200).json({ message: 'تم تفعيل الدورة بنجاح' });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};

exports.getAllTeachers = async (req, res) => {
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
	return	res.status(200).json({ count: teachers.length, data: teachers });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};

exports.getAllStudents = async (req, res) => {
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
	return	res.status(200).json({ count: students.length, data: students });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
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
	return	res.status(200).json({
			count: specializations.length,
			data: specializations,
		});
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};
exports.getPendingTeachersAndCourses = async (req, res) => {
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
				{
					model: Teacher,
					as: 'teacher',
					attributes: ['id', 'firstName', 'lastName', 'email'],
				},
			],
		});

		const response = {
			teacherCount: teachers.length,
			teacherData: teachers,
			courseCount: courses.length,
			courseData: courses,
		};

		// Check if there are no teachers
		if (teachers.length === 0) {
			response.teacherMessage = 'لا يوجد مدرسين قيد المراجعة';
		}

		// Check if there are no courses
		if (courses.length === 0) {
			response.courseMessage = 'لا يوجد دورات قيد المراجعة';
		}

		// Always return the response, including pending teachers
		return res.status(200).json(response);
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.deletePendingCourse = async (req, res) => {
	const { courseId } = req.params;

	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const course = await Course.findByPk(courseId, {
			include: [{ model: Teacher, as: 'teacher', attributes: ['email'] }], // Include teacher's email
		});

		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}

		if (course.courseVerify) {
			return res
				.status(400)
				.json({ error: 'لا يمكنك حذف دورة تم التحقق منها' });
		}

		// Send email notification to the teacher before deleting the course
		const teacherEmail = course.teacher.email;
		const subject = 'تم حذف دورتك';
		const text = `عزيزي المعلم،\n\nنأسف لإبلاغك أن دورتك "${course.title}" قد تم حذفها بسبب عدم تحققها. إذا كان لديك أي استفسارات، يرجى الاتصال بالإدارة.\n\nشكرًا لتفهمك.`;
		await sendVerificationEmail(teacherEmail, subject, text);

		// Delete the course
		await course.destroy();

	return	res.status(200).json({ message: 'تم حذف الدورة المعلقة بنجاح' });
	} catch (error) {
	return	res.status(500).json({ error: error.message });
	}
};
exports.getTeacherCourses = async (req, res) => {
	const { teacherId } = req.params;
	try {
		const teacher = await Teacher.findOne({ where: { id: teacherId } });
		if (!teacher) {
			return res.status(404).json({ error: 'المدرس غير موجود' });
		}
		const courses = await Course.findAll({
			where: { teacherId },
			include: [
				{
					model: Section,
					include: [
						{
							model: Lesson,
							include: [
								{
									model: Pdf,
								},
								{
									model: Video,
								},
							],
						},
					],
				},
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
