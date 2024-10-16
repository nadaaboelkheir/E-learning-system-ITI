const { Level, Student, Teacher, Course } = require('../models');
const {
	sendApprovalEmailToTeacher,
	sendRefuseEmailToTeacher,
	approveTeacherHtml,
	declineTeacherHtml,
	sendApprovalCourseToTeacher,
	approveCourseHtml,
	sendRefuseCourseToTeacher,
	declineCourseHtml,
} = require('../utils/mailer');
const AsyncHandler = require('express-async-handler');
const { deleteFilesFromCloudinary } = require('../services/multer.service');

exports.adminVerifyTeacher = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	if (req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacher = await Teacher.findByPk(teacherId);
	if (!teacher) {
		return res.status(404).json({ message: 'المدرس غير موجود' });
	}
	await teacher.update({ isEmailVerified: true });
	const subject = 'تم التحقق من حسابك';
	await sendApprovalEmailToTeacher(
		teacher.email,
		subject,
		approveTeacherHtml,
	);
	return res.status(200).json({ message: 'تم تفعيل المدرس بنجاح' });
});

exports.adminDeletePendingTeacher = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	if (req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacher = await Teacher.findByPk(teacherId);
	if (!teacher) {
		return res.status(404).json({ message: 'المدرس غير موجود' });
	}
	await teacher.destroy();
	const subject = 'لم يتم الموافقة علي طلبك';
	await sendRefuseEmailToTeacher(teacher.email, subject, declineTeacherHtml);
	return res.status(200).json({ message: 'تم حذف المدرس بنجاح' });
});

exports.adminVerifyCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	if (req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const course = await Course.findByPk(courseId, {
		include: [{ model: Teacher, as: 'teacher', attributes: ['email'] }],
	});

	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}

	await course.update({ courseVerify: true });

	const teacherEmail = course.teacher.email;
	const subject = 'تم الموافقة على دورتك';
	await sendApprovalCourseToTeacher(teacherEmail, subject, approveCourseHtml);

	return res.status(200).json({ message: 'تم تفعيل الدورة بنجاح' });
});

exports.getAllTeachers = AsyncHandler(async (req, res) => {
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
		return res.status(404).json({ message: 'لا يوجد مدرسين' });
	}
	return res.status(200).json({ count: teachers.length, data: teachers });
});

exports.getAllStudents = AsyncHandler(async (req, res) => {
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
		return res.status(404).json({ message: 'لا يوجد طلاب' });
	}
	return res.status(200).json({ count: students.length, data: students });
});

exports.getAllSubjects = AsyncHandler(async (req, res) => {
	const specializations = await Teacher.findAll({
		attributes: ['specialization'],
		group: ['specialization'],
	});
	if (!specializations || specializations.length === 0) {
		return res.status(404).json({ message: 'لا يوجد مواد دراسية' });
	}
	return res.status(200).json({
		count: specializations.length,
		data: specializations,
	});
});

exports.getPendingTeachersAndCourses = AsyncHandler(async (req, res) => {
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

	if (teachers.length === 0) {
		response.teacherMessage = 'لا يوجد مدرسين قيد المراجعة';
	}

	if (courses.length === 0) {
		response.courseMessage = 'لا يوجد دورات قيد المراجعة';
	}

	return res.status(200).json(response);
});

exports.deletePendingCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	if (req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const course = await Course.findByPk(courseId, {
		include: [{ model: Teacher, as: 'teacher', attributes: ['email'] }],
	});

	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}

	if (course.courseVerify) {
		return res
			.status(400)
			.json({ message: 'لا يمكنك حذف دورة تم التحقق منها' });
	}

	const teacherEmail = course.teacher.email;
	const subject = 'تم حذف دورتك';
	await sendRefuseCourseToTeacher(teacherEmail, subject, declineCourseHtml);

	if (course.image) {
		await deleteFilesFromCloudinary('images', imageUrl, 'image');
	}

	await course.destroy();

	return res.status(200).json({ message: 'تم حذف الدورة المعلقة بنجاح' });
});

exports.getTeacherCourses = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	const teacher = await Teacher.findOne({ where: { id: teacherId } });
	if (!teacher) {
		return res.status(404).json({ message: 'المدرس غير موجود' });
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
		return res.status(404).json({ message: 'لا يوجد دورات لهذا المدرس' });
	}
	return res.status(200).json({ count: courses.length, data: courses });
});
