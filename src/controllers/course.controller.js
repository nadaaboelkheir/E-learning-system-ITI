const AsyncHandler = require('express-async-handler');
const {
	Course,
	Section,
	Lesson,
	sequelize,
	Teacher,
	Level,
	Student,
	Wallet,
	Enrollment,
	Transaction,
	Admin,
	Quiz,
	QuizAttempt,
} = require('../models');
const { deleteFilesFromCloudinary } = require('../services/multer.service');

exports.createCourseWithSections = AsyncHandler(async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ message: 'الرجاء تحميل صورة الدورة' });
	}

	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ message: 'البريد الالكتروني غير مفعل' });
	}

	const { title, description, levelId, price, discountedPrice, sections } =
		req.body;
	const imageurl = req.file.path || req.file.url;
	const teacherId = req.teacher.id;

	const transaction = await sequelize.transaction();

	try {
		const level = await Level.findOne({ where: { id: levelId } });
		if (!level) {
			await transaction.rollback();
			return res.status(404).json({ message: 'المستوى غير موجود' });
		}

		const existingCourse = await Course.findOne({
			where: { title },
			transaction,
		});
		if (existingCourse) {
			await transaction.rollback();
			return res.status(409).json({ message: 'الدورة موجودة بالفعل' });
		}

		const courseData = {
			title,
			description,
			levelId,
			price,
			discountedPrice,
			teacherId,
			image: imageurl,
		};
		const course = await Course.create(courseData, { transaction });

		if (!course.id) {
			await transaction.rollback();
			return res.status(500).json({ message: 'خطأ في إنشاء الدورة' });
		}

		for (const sectionData of sections) {
			if (!sectionData.title || !sectionData.title.trim()) {
				await transaction.rollback();
				return res
					.status(400)
					.json({ message: 'يجب إدخال عنوان لكل وحدة' });
			}

			await Section.create(
				{ title: sectionData.title, courseId: course.id },
				{ transaction },
			);
		}

		await transaction.commit();
		return res
			.status(201)
			.json({ message: 'تم انشاء الدورة مع الوحدات بنجاح' });
	} catch (error) {
		await transaction.rollback();
		return res
			.status(500)
			.json({ error: 'خطأ في إنشاء الدورة. الرجاء المحاولة مرة أخرى' });
	}
});

exports.getSectionsForCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;
	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	const sections = await Section.findAll({
		where: { courseId: courseId },
		include: [
			{ model: Lesson, attributes: ['id', 'title'], as: 'lessons' },
		],
		order: [['createdAt', 'ASC']],
	});

	return res.status(200).json({ count: sections.length, data: sections });
});
exports.getSectionsForCourseById = AsyncHandler(async (req, res) => {
	const { sectionId } = req.params;

	const section = await Section.findOne({
		where: { id: sectionId },
		include: [
			{ model: Lesson, attributes: ['id', 'title'], as: 'lessons' },
		],
		order: [['createdAt', 'ASC']],
	});

	return res.status(200).json({ data: section });
});
exports.deleteSection = AsyncHandler(async (req, res) => {
	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ message: 'البريد الالكتروني غير مفعل' });
	}
	const { sectionId } = req.params;
	const section = await Section.findOne({ where: { id: sectionId } });
	if (!section) {
		return res.status(404).json({ message: 'القسم غير موجود' });
	}
	await section.destroy();
	res.status(200).json({ message: 'تم حذف القسم بنجاح' });
});
exports.createLesson = AsyncHandler(async (req, res) => {
	const { title, description } = req.body;

	const { sectionId } = req.params;

	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ message: 'البريد الالكتروني غير مفعل' });
	}

	const teacherId = req.teacher.id;

	const section = await Section.findOne({
		where: { id: sectionId },
	});

	if (!section) {
		return res.status(404).json({ message: 'السكشن غير موجودة' });
	}
	const course = await Course.findOne({
		where: { id: section.courseId, teacherId },
	});

	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}

	const lessonData = {
		title,
		sectionId,
		description,
	};

	if (req.files) {
		if (req.files.pdfFile) {
			lessonData.pdfUrl = req.files.pdfFile[0].path;
		}
		if (req.files.videoFile) {
			lessonData.videoUrl = req.files.videoFile[0].path;
		}
	}

	const lesson = await Lesson.create(lessonData);

	return res.status(201).json({ data: lesson });
});
exports.deleteLesson = AsyncHandler(async (req, res) => {
	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ message: 'البريد الالكتروني غير مفعل' });
	}
	const { lessonId } = req.params;
	const lesson = await Lesson.findOne({ where: { id: lessonId } });
	if (!lesson) {
		return res.status(404).json({ message: 'الدرس غير موجود' });
	}
	const pdfUrl = lesson.pdfUrl;
	const videoUrl = lesson.videoUrl;
	if (pdfUrl) {
		await deleteFilesFromCloudinary('pdfs', pdfUrl, 'pdf');
	}
	if (videoUrl) {
		await deleteFilesFromCloudinary('videos', videoUrl, 'video');
	}
	await lesson.destroy();
	res.status(200).json({ message: 'تم حذف الدرس بنجاح' });
});
exports.updateLesson = AsyncHandler(async (req, res) => {
	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ message: 'البريد الالكتروني غير مفعل' });
	}

	const { lessonId } = req.params;
	const lesson = await Lesson.findOne({ where: { id: lessonId } });

	if (!lesson) {
		return res.status(404).json({ message: 'الدرس غير موجود' });
	}

	const { title, description } = req.body;

	lesson.title = title || lesson.title;
	lesson.description = description || lesson.description;

	if (req.files?.pdfFile) {
		if (lesson.pdfUrl) {
			await deleteFilesFromCloudinary('pdfs', lesson.pdfUrl, 'raw');
		}
		lesson.pdfUrl = req.files.pdfFile[0].path;
	}

	if (req.files?.videoFile) {
		if (lesson.videoUrl) {
			await deleteFilesFromCloudinary('videos', lesson.videoUrl, 'video');
		}
		lesson.videoUrl = req.files.videoFile[0].path;
	}

	await lesson.save();

	res.status(200).json({ message: 'تم تحديث الدرس بنجاح' });
});

exports.updateCourseWithSections = AsyncHandler(async (req, res) => {
	const courseId = req.params.courseId;
	const { section } = req.body;

	if (req.role !== 'teacher') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const teacherId = req.teacher.id;
	const transaction = await sequelize.transaction();

	try {
		const course = await Course.findOne({
			where: { id: courseId, teacherId },
			transaction,
		});

		if (!course) {
			await transaction.rollback();
			return res.status(404).json({ message: 'الدورة غير موجودة' });
		}

		// Update course image if provided
		if (req.file) {
			if (course.image) {
				// Delete old image from Cloudinary
				await deleteImageFromCloudinary('images', course.image);
			}
			course.image = req.file.path; // Update the course image path
		}

		if (!Array.isArray(section)) {
			return res
				.status(400)
				.json({ message: 'يجب إضافة الأقسام بشكل صحيح' });
		}

		for (const sectionData of section) {
			if (sectionData.id) {
				// Update existing section
				const existingSection = await Section.findByPk(sectionData.id, {
					transaction,
				});
				if (existingSection) {
					existingSection.title = sectionData.title;
					await existingSection.save({ transaction });
				}
			} else {
				// Create a new section
				await Section.create(
					{
						title: sectionData.title,
						courseId: course.id,
					},
					{ transaction },
				);
			}
		}

		await course.save({ transaction }); // Save updated course details
		await transaction.commit();
		res.status(200).json({ message: 'تم تحديث الدورة بنجاح' });
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ error: 'حدث خطأ أثناء تحديث الدورة' });
	}
});

exports.deleteCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	if (req.role !== 'teacher' && req.role !== 'admin') {
		return res.status(401).json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	let course;
	if (req.role === 'teacher') {
		const teacherId = req.teacher.id;
		course = await Course.findOne({
			where: { id: courseId, teacherId },
		});
	} else {
		course = await Course.findOne({
			where: { id: courseId },
		});
	}
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	const imageUrl = course.image;
	if (imageUrl) {
		await deleteFilesFromCloudinary('images', imageUrl, 'image');
	}
	await course.destroy();
	return res.status(200).json({ message: 'تم حذف الدورة بنجاح' });
});

exports.getTeacherCourses = AsyncHandler(async (req, res) => {
	const teacherId = req.params.teacherId || req.teacher.id;

	const teacher = await Teacher.findOne({
		where: { id: teacherId },
	});
	if (!teacher) {
		return res.status(404).json({ message: 'المدرس غير موجود' });
	}
	const courses = await Course.findAll({
		where: { teacherId },
		order: [['createdAt', 'DESC']],
		include: [
			{
				model: Section,
				as: 'sections',
				include: [
					{
						model: Lesson,
						as: 'lessons',
					},
				],
			},
			{
				model: Level,
				attributes: ['id', 'title'],
				as: 'level',
			},
			{
				model: Student,
				as: 'students',
				attributes: ['id', 'firstName', 'lastName'],
			},
		],
	});

	if (!courses || courses.length === 0) {
		return res.status(404).json({ message: 'لا يوجد دورات لهذا المدرس' });
	}

	const sortedCourses = courses.map((course) => {
		course.sections.sort(
			(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
		);

		course.sections.forEach((section) => {
			section.lessons.sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
			);
		});

		return course;
	});

	return res
		.status(200)
		.json({ count: sortedCourses.length, data: sortedCourses });
});

exports.getTeacherSections = AsyncHandler(async (req, res) => {
	const teacherId = req.teacher.id;
	const courses = await Course.findAll({
		where: { teacherId },
		include: [
			{
				model: Section,
				as: 'sections',
			},
		],
	});

	let sections = [];
	courses.forEach((course) => {
		sections = sections.concat(course.sections);
	});

	if (sections.length === 0) {
		return res.status(404).json({ message: 'لا يوجد وحدات لهذا المدرس' });
	}

	return res.status(200).json({ count: sections.length, data: sections });
});

exports.getCourseDetails = AsyncHandler(async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findOne({
			where: { id },
			include: [
				{
					model: Section,
					as: 'sections',
					attributes: ['id', 'title', 'createdAt'],
					include: [
						{
							model: Lesson,
							as: 'lessons',
							attributes: [
								'id',
								'title',
								'videoUrl',
								'description',
								'pdfUrl',
								'createdAt',
							],
						},
					],
				},
				{
					model: Teacher,
					as: 'teacher',
					attributes: ['id', 'firstName', 'lastName'],
				},
				{
					model: Level,
					as: 'level',
					attributes: ['title'],
				},
			],
		});

		if (!course) {
			return res.status(404).json({ message: 'الدورة غير موجودة' });
		}

		const lessonsCount = Array.isArray(course.sections)
			? course.sections.reduce((count, section) => {
					return (
						count +
						(Array.isArray(section.lessons)
							? section.lessons.length
							: 0)
					);
				}, 0)
			: 0;

		const { id: teacherId, firstName, lastName } = course.teacher;
		const { title: levelTitle } = course.level;

		const sortedSections = course.sections.sort(
			(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
		);

		const sectionsWithLessons = sortedSections.map((section) => ({
			id: section.id,
			title: section.title,
			lessons: section.lessons
				.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
				.map((lesson) => ({
					id: lesson.id,
					title: lesson.title,
					videoUrl: lesson.videoUrl,
					description: lesson.description,
					pdfUrl: lesson.pdfUrl,
				})),
		}));

		return res.status(200).json({
			id: course.id,
			title: course.title,
			description: course.description,
			image: course.image,
			levelId: course.levelId,
			levelTitle,
			teacherId,
			teacherName: `${firstName} ${lastName}`,
			price: course.price,
			createdAt: course.createdAt,
			updatedAt: course.updatedAt,
			lessonsCount,
			sections: sectionsWithLessons,
		});
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
});

exports.getAllCourses = AsyncHandler(async (req, res) => {
	const courses = await Course.findAll({
		where: {
			courseVerify: true,
		},
		include: [
			{
				model: Teacher,
				as: 'teacher',
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: Level,
				as: 'level',
				attributes: ['title'],
			},
		],
	});
	if (!courses || courses.length === 0) {
		return res.status(404).json({ message: 'لا يوجد دورات' });
	}
	const formattedCourses = courses.map((course) => ({
		id: course.id,
		title: course.title,
		description: course.description,
		price: course.price,
		discountedPrice: course?.discountedPrice,
		image: course.image,
		teacherId: course.teacher.id,
		teacherName: course.teacher
			? `${course.teacher.firstName} ${course.teacher.lastName}`
			: 'No teacher assigned',
		levelTitle: course.level?.title || 'No level assigned',
	}));
	return res
		.status(200)
		.json({ count: formattedCourses.length, data: formattedCourses });
});

exports.getStudentsInCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;
	const course = await Course.findOne({
		where: { id: courseId },
		include: [
			{
				model: Student,
				as: 'students',
				attributes: ['id', 'firstName', 'lastName'],
				through: {
					attributes: [],
				},
			},
		],
	});
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	return res
		.status(200)
		.json({ count: course.students.length, data: course.students });
});
// student
exports.buyCourseWithWallet = AsyncHandler(async (req, res) => {
	const { studentId, courseId } = req.body;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}
	const existingEnrollment = await Enrollment.findOne({
		where: { studentId, courseId },
	});

	if (existingEnrollment) {
		return res
			.status(400)
			.json({ message: 'الطالب مشترك في هذه الدورة بالفعل' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});
	if (!wallet) {
		return res.status(404).json({ message: 'المحفظة غير موجودة' });
	}

	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}

	if (wallet.balance < course.price) {
		return res
			.status(400)
			.json({ message: 'ليس لديك رصيد كافي لشراء هذه الدورة' });
	}

	const teacherShare = course.price * 0.8;
	const adminShare = course.price * 0.2;

	const teacher = await Teacher.findOne({ where: { id: course.teacherId } });
	const admin = await Admin.findOne({ where: { email: 'admin@gmail.com' } });

	if (!teacher || !admin) {
		return res
			.status(500)
			.json({ message: 'المدرس او الإدارة غير موجودة' });
	}

	const teacherWallet = await Wallet.findOne({
		where: { walletableId: teacher.id, walletableType: 'Teacher' },
	});
	const adminWallet = await Wallet.findOne({
		where: { walletableId: admin.id, walletableType: 'Admin' },
	});

	if (!teacherWallet || !adminWallet) {
		return res.status(500).json({ message: 'المحفظة غير موجودة' });
	}
	const updatedBalance = wallet.balance - course.price;
	await wallet.update({ balance: updatedBalance });

	await teacherWallet.update({
		balance: teacherWallet.balance + teacherShare,
	});
	await adminWallet.update({ balance: adminWallet.balance + adminShare });
	const enrollment = await Enrollment.create({
		studentId: student.id,
		courseId: course.id,
		price: course.price,
		enrollDate: new Date(),
	});

	const transactionDetails = {
		amount: course.price,
		currency: 'EGP',
		walletId: wallet.id,
		type: 'completed',
		transactionDate: new Date(),
	};

	const transaction = await Transaction.create(transactionDetails);

	return res.status(200).json({
		message: 'تمت العملية بنجاح',
		transaction,
		enrollment,
	});
});

exports.getStudentEnrolledCourses = AsyncHandler(async (req, res) => {
	const studentId = req.params.studentId || req.student.id;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'هذا الطالب غير موجود' });
	}

	const enrollments = await Enrollment.findAll({
		where: { studentId },
		include: [
			{
				model: Course,
				attributes: ['id', 'title', 'description', 'price', 'image'],
			},
		],
	});

	if (!enrollments.length) {
		return res.status(200).json({
			message: 'لا توجد دورات مشتركة بعد',
		});
	}

	const courses = enrollments.map((enrollment) => enrollment.Course);

	return res.status(200).json({
		message: 'تمت العملية بنجاح',
		courses,
		numberOfCourses: courses.length,
	});
});

exports.getCertificateForCourse = AsyncHandler(async (req, res) => {
	const { courseId, studentId } = req.params;

	const enrollment = await Enrollment.findOne({
		where: {
			studentId: studentId,
			courseId: courseId,
		},
	});

	if (!enrollment) {
		return res
			.status(404)
			.json({ message: 'هذا الطالب ليس مشترك في هذه الدورة' });
	}

	const quizzes = await Quiz.findAll({
		where: { courseId: courseId },
	});

	if (quizzes.length === 0) {
		return res
			.status(404)
			.json({ message: 'لا توجد اختبارات متاحة لهذة الدورة' });
	}

	let totalGrade = 0;
	let allQuizzesCompleted = true;

	for (const quiz of quizzes) {
		const studentQuiz = await QuizAttempt.findOne({
			where: { quizId: quiz.id, studentId: studentId },
		});

		if (!studentQuiz) {
			allQuizzesCompleted = false;
			break;
		}

		totalGrade += studentQuiz.score;
	}

	if (!allQuizzesCompleted) {
		return res.status(400).json({ message: 'لم تكمل جميع الاختبارات بعد' });
	}

	return res.status(200).json({
		message: 'تمت العملية بنجاح',
		totalGrade,
		averageGrade: totalGrade / quizzes.length,
	});
});
