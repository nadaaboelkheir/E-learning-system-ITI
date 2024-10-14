const AsyncHandler = require('express-async-handler');
const {
	Course,
	Section,
	Lesson,
	Pdf,
	Video,
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
const cloudinary = require('../configs/cloudinary.config');

const deleteImageFromCloudinary = async (imageUrl) => {
	try {
		const publicId = imageUrl.split('/').pop().split('.')[0];
		await cloudinary.uploader.destroy(`images/${publicId}`);
		console.log(
			`Image with public ID: ${publicId} deleted successfully from Cloudinary.`,
		);
		return true;
	} catch (error) {
		console.error('Error deleting image from Cloudinary:', error);
		throw new Error('Failed to delete image from Cloudinary');
	}
};
exports.createFullCourse = AsyncHandler(async (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: 'الرجاء تحميل صورة الدورة' });
	}

	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	if (!req.teacher.isEmailVerified) {
		return res.status(401).json({ error: 'البريد الالكتروني غير مفعل' });
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
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}

		const existingCourse = await Course.findOne({
			where: { title },
			transaction,
		});
		if (existingCourse) {
			await transaction.rollback();
			return res.status(409).json({ error: 'الدورة موجودة بالفعل' });
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
			return res.status(500).json({ error: 'خطأ في إنشاء الدورة' });
		}

		for (const sectionData of sections) {
			const section = await Section.create(
				{ title: sectionData.title, courseId: course.id },
				{ transaction },
			);

			for (const lessonData of sectionData.lessons) {
				await Lesson.create(
					{
						title: lessonData.title,
						description: lessonData.description,
						pdfUrl: lessonData.pdfUrl,
						videoUrl: lessonData.videoUrl,
						sectionId: section.id,
					},
					{ transaction },
				);
			}
		}

		await transaction.commit();
		return res.status(201).json({ message: 'تم انشاء الدورة بنجاح' });
	} catch (error) {
		await transaction.rollback();
		console.error('Error creating course:', error);
		return res
			.status(500)
			.json({ error: 'An error occurred while creating the course.' });
	}
});

exports.updateCourse = AsyncHandler(async (req, res) => {
	const courseId = req.params.courseId;
	const { title, description, levelId, price, discountedPrice, section } =
		req.body;

	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
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
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}

		// Update course details only if new values are provided
		if (title !== undefined) {
			course.title = title;
		}
		if (description !== undefined) {
			course.description = description;
		}
		if (levelId !== undefined) {
			course.levelId = levelId;
		}
		if (price !== undefined) {
			course.price = price;
		}
		if (discountedPrice !== undefined) {
			course.discountedPrice = discountedPrice;
		}
		if (req.file) {
			if (course.image) {
				await deleteImageFromCloudinary(course.image);
			}
			course.image = req.file.path;
		}

		await course.save({ transaction });

		// Check if section is an array before iterating
		if (Array.isArray(section)) {
			for (const sectionData of section) {
				let existingSection;

				// Check if we have an existing section to update
				if (sectionData.id) {
					existingSection = await Section.findByPk(sectionData.id, {
						transaction,
					});
				}

				// Update existing section or create a new one
				if (existingSection) {
					existingSection.title = sectionData.title;
					await existingSection.save({ transaction });
					await handleLessons(
						sectionData.lessons,
						existingSection.id,
						transaction,
					);
				} else {
					const newSection = await Section.create(
						{
							title: sectionData.title,
							courseId: course.id,
						},
						{ transaction },
					);
					await handleLessons(
						sectionData.lessons,
						newSection.id,
						transaction,
					);
				}
			}
		} else if (section !== undefined) {
			return res
				.status(400)
				.json({ error: 'يجب عليك اضافة الدروس بشكل صحيح' });
		}

		await transaction.commit();

		res.status(200).json({
			message: 'تم تحديث الدورة بنجاح',
		});
	} catch (error) {
		console.error('Error updating course:', error);
		await transaction.rollback();
		res.status(500).json({ error: 'حدث خطأ أثناء تحديث الدورة' });
	}
});

// Function to handle lessons associated with sections
exports.handleLessons = async (lessons, sectionId, transaction) => {
	if (!Array.isArray(lessons)) return;

	for (const lessonData of lessons) {
		let existingLesson;

		// Check if we have an existing lesson to update
		if (lessonData.id) {
			existingLesson = await Lesson.findByPk(lessonData.id, {
				transaction,
			});
		}

		// Update existing lesson or create a new one
		if (existingLesson) {
			existingLesson.title = lessonData.title;
			existingLesson.description = lessonData.description;

			// Update PDFs and videos for the existing lesson
			await handleMedia(
				lessonData.pdfs,
				'pdf',
				existingLesson.id,
				transaction,
			);
			await handleMedia(
				lessonData.videos,
				'video',
				existingLesson.id,
				transaction,
			);

			await existingLesson.save({ transaction });
		} else {
			const newLesson = await Lesson.create(
				{
					title: lessonData.title,
					description: lessonData.description,
					sectionId,
				},
				{ transaction },
			);

			// Ensure at least one PDF and one video are provided
			if (!lessonData.pdfs || lessonData.pdfs.length === 0) {
				throw new Error('يجب اضافة ملف واحد علي الأقل لكل درس');
			}
			if (!lessonData.videos || lessonData.videos.length === 0) {
				throw new Error('يجب اضافة فيديو واحد علي الأقل لكل درس');
			}

			// Handle PDFs for the newly created lesson
			await handleMedia(
				lessonData.pdfs,
				'pdf',
				newLesson.id,
				transaction,
			);

			// Handle Videos for the newly created lesson
			await handleMedia(
				lessonData.videos,
				'video',
				newLesson.id,
				transaction,
			);
		}
	}
};

// Function to handle media files (PDFs and Videos)
exports.handleMedia = async (mediaList, mediaType, lessonId, transaction) => {
	if (!Array.isArray(mediaList)) return;

	for (const mediaData of mediaList) {
		let existingMedia;

		// Check if we have an existing media item to update
		if (mediaData.id) {
			existingMedia =
				mediaType === 'pdf'
					? await Pdf.findByPk(mediaData.id, { transaction })
					: await Video.findByPk(mediaData.id, { transaction });
		}

		// Update existing media or create a new one
		if (existingMedia) {
			existingMedia.title = mediaData.title;
			existingMedia.description = mediaData.description;
			existingMedia.url = mediaData.url; // Assuming all media have a URL field

			await existingMedia.save({ transaction });
		} else {
			const newMedia =
				mediaType === 'pdf'
					? await Pdf.create(
							{
								title: mediaData.title,
								description: mediaData.description,
								url: mediaData.url,
								lessonId,
							},
							{ transaction },
						)
					: await Video.create(
							{
								title: mediaData.title,
								url: mediaData.url,
								lessonId,
							},
							{ transaction },
						);
		}
	}
};

exports.deleteCourse = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	if (req.role !== 'teacher' && req.role !== 'admin') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
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
		return res.status(404).json({ error: 'الدورة غير موجودة' });
	}
	const imageUrl = course.image;
	await deleteImageFromCloudinary(imageUrl);
	await course.destroy();
	return res.status(200).json({ message: 'تم حذف الدورة بنجاح' });
});

exports.getTeacherCourses = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	const teacher = await Teacher.findOne({
		where: { id: teacherId },
	});
	if (!teacher) {
		return res.status(404).json({ error: 'المدرس غير موجود' });
	}
	const courses = await Course.findAll({
		where: { teacherId },
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
		],
	});
	if (!courses || courses.length === 0) {
		return res.status(404).json({ error: 'لا يوجد دورات لهذا المدرس' });
	}
	return res.status(200).json({ count: courses.length, data: courses });
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
		return res.status(404).json({ error: 'لا يوجد وحدات لهذا المدرس' });
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
					attributes: ['id', 'title'],
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
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}

		// Calculate the total number of lessons
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

		// Move teacher data to main response object
		const { id: teacherId, firstName, lastName } = course.teacher;

		// Move level data to main response object
		const { levelTitle } = course.level;

		// Prepare sections with lessons included
		const sectionsWithLessons = course.sections.map((section) => ({
			id: section.id,
			title: section.title,
			lessons: section.lessons.map((lesson) => ({
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
			teacherId, // Add teacherId to the main object
			teacherName: `${firstName} ${lastName}`, // Combine first and last name
			price: course.price,
			createdAt: course.createdAt,
			updatedAt: course.updatedAt,
			lessonsCount, // Add the number of lessons
			sections: sectionsWithLessons, // Include sections with lessons
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
		return res.status(404).json({ error: 'لا يوجد دورات' });
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
		return res.status(404).json({ error: 'الدورة غير موجودة' });
	}
	return res
		.status(200)
		.json({ count: course.students.length, data: course.students });
});
// student
exports.buyCourseWithWallet = AsyncHandler(async (req, res) => {
	const { studentId, courseId, adminId } = req.body;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}
	const existingEnrollment = await Enrollment.findOne({
		where: { studentId, courseId },
	});

	if (existingEnrollment) {
		return res
			.status(400)
			.json({ message: 'Student is already enrolled in this course' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});
	if (!wallet) {
		return res.status(404).json({ message: 'Wallet not found' });
	}

	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'Course not found' });
	}

	if (wallet.balance < course.price) {
		return res
			.status(400)
			.json({ message: 'Insufficient wallet balance to buy the course' });
	}

	const teacherShare = course.price * 0.8;
	const adminShare = course.price * 0.2;

	const teacher = await Teacher.findOne({ where: { id: course.teacherId } });
	const admin = await Admin.findOne({ where: { id: adminId } });

	if (!teacher || !admin) {
		return res.status(500).json({ message: 'Teacher or Admin not found' });
	}

	const teacherWallet = await Wallet.findOne({
		where: { walletableId: teacher.id, walletableType: 'Teacher' },
	});
	const adminWallet = await Wallet.findOne({
		where: { walletableId: admin.id, walletableType: 'Admin' },
	});

	if (!teacherWallet || !adminWallet) {
		return res
			.status(500)
			.json({ message: 'Teacher or Admin wallet not found' });
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
		message: 'Course purchased successfully, wallet updated',
		transaction,
		enrollment,
	});
});
exports.getStudentEnrolledCourses = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
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
			message: 'No courses found for the student',
			courses: [],
		});
	}
	console.log(enrollments);

	const courses = enrollments.map((enrollment) => enrollment.Course);

	return res.status(200).json({
		message: 'Student courses retrieved successfully',
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
			.json({ message: 'User not enrolled in this course' });
	}

	const quizzes = await Quiz.findAll({
		where: { courseId: courseId },
	});

	if (quizzes.length === 0) {
		return res
			.status(404)
			.json({ message: 'No quizzes available for this course' });
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
		return res
			.status(400)
			.json({ message: 'Not all quizzes have been taken' });
	}

	return res.status(200).json({
		message: 'All quizzes have been taken',
		totalGrade,
		averageGrade: totalGrade / quizzes.length,
	});
});
