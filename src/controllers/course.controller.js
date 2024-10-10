const {
	Course,
	Section,
	Lesson,
	Pdf,
	Video,
	sequelize,
	Teacher,
	Student,
	Wallet,
	Enrollment,
   Transaction
} = require('../models');
const AsyncHandler = require('express-async-handler');
exports.createFullCourse = async (req, res) => {
	const { title, description, levelId, price, sections } = req.body;
	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacherId = req.teacher.id;
	const transaction = await sequelize.transaction();

	try {
		const existingCourse = await Course.findOne({
			where: { title },
			transaction,
		});
		if (existingCourse) {
			await transaction.rollback();
			return res.status(400).json({ error: 'الدورة موجودة بالفعل' });
		}

		const course = await Course.create(
			{
				title,
				description,
				levelId,
				price,
				teacherId,
			},
			{ transaction },
		);

		// Check if course creation was successful
		if (!course.id) {
			await transaction.rollback();
			return res.status(500).json({ error: 'خطأ في إنشاء الدورة' });
		}

		for (const sectionData of sections) {
			const section = await Section.create(
				{
					title: sectionData.title,
					courseId: course.id, // Set the courseId from the created course
				},
				{ transaction },
			);

			for (const lessonData of sectionData.lessons) {
				const lesson = await Lesson.create(
					{
						title: lessonData.title,
						description: lessonData.description,
						sectionId: section.id,
					},
					{ transaction },
				);

				if (lessonData.pdfs) {
					for (const pdfData of lessonData.pdfs) {
						await Pdf.create(
							{
								title: pdfData.title,
								description: pdfData.description,
								url: pdfData.url,
								lessonId: lesson.id,
							},
							{ transaction },
						);
					}
				}

				if (lessonData.videos) {
					for (const videoData of lessonData.videos) {
						await Video.create(
							{
								title: videoData.title,
								url: videoData.url,
								lessonId: lesson.id,
							},
							{ transaction },
						);
					}
				}
			}
		}

		await transaction.commit();

		res.status(201).json({
			message: 'تم انشاء الدورة بنجاح',
		});
	} catch (error) {
		await transaction.rollback();
		res.status(500).json({ error: error.message });
	}
};

exports.updateCourse = async (req, res) => {
	const courseId = req.params.courseId;
	const { title, description, levelId, price, section } = req.body;

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
};

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

exports.deleteCourse = async (req, res) => {
	const { id } = req.params;
	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacherId = req.teacher.id;
	try {
		const course = await Course.findOne({
			where: { id, teacherId },
		});
		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}

		await course.destroy();
		return res.status(200).json({ message: 'تم حذف الدورة بنجاح' });
	} catch (error) {
		return res.status(500).json({ error: error.message });
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
			],
		});
		if (!courses || courses.length === 0) {
			return res.status(404).json({ error: 'لا يوجد دورات لهذا المدرس' });
		}
		return res.status(200).json({ data: courses });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.getCourseDetails = async (req, res) => {
	const { id } = req.params;
	try {
		const course = await Course.findOne({
			where: { id },
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
			],
		});
		if (!course) {
			return res.status(404).json({ error: 'الدورة غير موجودة' });
		}
		return res.status(200).json({ data: course });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

exports.getAllCourses = async (req, res) => {
	try {
		const courses = await Course.findAll();
		if (!courses || courses.length === 0) {
			return res.status(404).json({ error: 'لا يوجد دورات' });
		}
		return res.status(200).json({ count: courses.length, data: courses });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
}; 

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
