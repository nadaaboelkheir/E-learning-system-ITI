const AsyncHandler = require('express-async-handler');
const {
	Student,
	Wallet,
	Transaction,
	Course,
	Teacher,
	Admin,
	Enrollment,
	Review,
	Quiz,
	Answer,
	QuizAttempt,
	Question,
} = require('../models');
const { Op } = require('sequelize');

exports.buyCourseWithWallet = AsyncHandler(async (req, res) => {
	const { studentId, courseId, adminId } = req.body;

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
	const admin = await Admin.findOne({ where: { id: adminId } });

	if (!teacher || !admin) {
		return res.status(500).json({ message: 'المدرس او المسئول غير موجود' });
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
		message: 'تم الشراء بنجاح',
		transaction,
		enrollment,
	});
});

exports.getStudentCourses = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
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

exports.reviewEnrolledCourseByStudent = AsyncHandler(async (req, res) => {
	const { studentId, courseId, rate, comment } = req.body;
	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}
	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	const enrollment = await Enrollment.findOne({
		where: {
			studentId: studentId,
			courseId: courseId,
		},
	});

	if (!enrollment) {
		return res.status(403).json({ message: 'انت غير مشترك في هذه الدورة' });
	}
	const review = await Review.create({
		studentId: student.id,
		courseId: course.id,
		rate,
		comment,
	});

	return res.status(200).json({
		message: 'تم تقييم الدورة بنجاح',
		review,
	});
});

exports.getReviewsMadeByStudent = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const reviews = await Review.findAll({
		where: {
			studentId: studentId,
		},
		include: [{ model: Course, attributes: ['id', 'title'] }],
	});

	if (reviews.length === 0) {
		return res.status(404).json({ message: 'لا توجد تقييمات بعد' });
	}

	return res.status(200).json({
		message: 'التقييمات التي تم تقديمها',
		reviews: reviews,
	});
});

exports.getCourseReviews = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}

	const reviews = await Review.findAll({
		where: {
			courseId: courseId,
		},
		include: [
			{ model: Student, attributes: ['id', 'firstName', 'lastName'] },
		],
	});

	if (reviews.length === 0) {
		return res.status(404).json({ message: 'لا توجد تقييمات بعد' });
	}

	return res.status(200).json({
		message: 'التقييمات التي تم تقديمها',
		reviews: reviews,
	});
});

exports.takeQuiz = AsyncHandler(async (req, res) => {
	const { studentId, courseId, quizId, answers } = req.body;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}
	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	const quiz = await Quiz.findOne({ where: { id: quizId } });
	if (!quiz) {
		return res.status(404).json({ message: 'الاختبار غير موجود' });
	}
	const enrollment = await Enrollment.findOne({
		where: {
			studentId: studentId,
			courseId: courseId,
		},
	});
	if (!enrollment) {
		return res.status(403).json({ message: 'انت غير مشترك في هذه الدورة' });
	}
	const existingAttempt = await QuizAttempt.findOne({
		where: { studentId, quizId },
	});
	if (existingAttempt) {
		return res
			.status(403)
			.json({ message: 'تم تقديم هذا الاختبار من قبل' });
	}

	const questions = await Question.findAll({
		where: { quizId },
		include: [{ model: Answer }],
	});

	let totalScore = 0;
	let maxScore = 0;

	for (const question of questions) {
		const studentAnswer = answers.find((a) => a.questionId === question.id);
		console.log(question.Answers);
		const correctAnswer = question.Answers.find((ans) => ans.isCorrect);

		if (studentAnswer && studentAnswer.answerId === correctAnswer.id) {
			totalScore += question.mark;
		}

		maxScore += question.mark;
	}

	await QuizAttempt.create({
		studentId,
		quizId,
		score: totalScore,
		maxScore,
	});

	res.status(200).json({
		message: 'تم حل الاختبار بنجاح',
		score: totalScore,
		maxScore,
	});
});

exports.getStudentQuizzes = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}

	const quizAttempts = await QuizAttempt.findAll({
		where: { studentId },
		include: [
			{
				model: Quiz,
				attributes: ['title', 'Duration'],
			},
		],
	});

	if (!quizAttempts || quizAttempts.length === 0) {
		return res.status(404).json({ message: 'لا توجد اختبارات من قبلك' });
	}

	res.status(200).json({
		quizzes: quizAttempts.map((attempt) => ({
			quizTitle: attempt.Quiz.title,
			duration: attempt.Quiz.Duration,
			score: attempt.score,
			maxScore: attempt.maxScore,
		})),
	});
});

exports.calculateStudentEvaluation = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}

	const quizAttempts = await QuizAttempt.findAll({
		where: { studentId },
	});

	if (!quizAttempts || quizAttempts.length === 0) {
		return res.status(404).json({ message: 'لا توجد اختبارات من قبلك' });
	}

	let totalScore = 0;
	let maxScore = 0;

	quizAttempts.forEach((attempt) => {
		totalScore += attempt.score;
		maxScore += attempt.maxScore;
	});

	const percentage = (totalScore / maxScore) * 100;

	let grade = 'F';
	if (percentage >= 90) {
		grade = 'A';
	} else if (percentage >= 80) {
		grade = 'B';
	} else if (percentage >= 70) {
		grade = 'C';
	} else if (percentage >= 60) {
		grade = 'D';
	}

	res.status(200).json({
		totalScore,
		maxScore,
		percentage: percentage.toFixed(2),
		grade,
	});
});

exports.getCourseRating = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const reviews = await Review.findAll({
		where: { courseId },
		attributes: ['rate'],
	});

	if (!reviews || reviews.length === 0) {
		return res.status(404).json({ message: 'لا توجد تقييمات لهذه الدورة' });
	}

	const totalRating = reviews.reduce((sum, review) => sum + review.rate, 0);
	const averageRating = totalRating / reviews.length;

	res.status(200).json({
		courseId,
		averageRating: averageRating.toFixed(2),
		totalReviews: reviews.length,
	});
});

exports.getTeacherRatingFromCourses = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	const courses = await Course.findAll({
		where: { teacherId },
		attributes: ['id'],
	});

	if (!courses || courses.length === 0) {
		return res.status(404).json({ message: 'لا يوجد دورات لهذا المدرس' });
	}

	let totalRating = 0;
	let totalReviews = 0;

	for (const course of courses) {
		const reviews = await Review.findAll({
			where: { courseId: course.id },
			attributes: ['rate'],
		});

		if (reviews.length > 0) {
			const courseTotalRating = reviews.reduce(
				(sum, review) => sum + review.rate,
				0,
			);
			const courseAverageRating = courseTotalRating / reviews.length;

			totalRating += courseAverageRating;
			totalReviews += 1;
		}
	}

	if (totalReviews === 0) {
		return res.status(404).json({
			message: 'لا يوجد تقييمات لهذا المدرس في جميع الدورات',
		});
	}

	const teacherRating = totalRating / totalReviews;

	res.status(200).json({
		teacherId,
		teacherRating: teacherRating.toFixed(2),
		totalCourses: totalReviews,
	});
});

exports.getStudentsForParent = AsyncHandler(async (req, res) => {
	const { parentPhoneNumber } = req.params;

	if (!parentPhoneNumber) {
		return res
			.status(400)
			.json({ message: 'رقم هاتف ولي الأمر غير موجود' });
	}
	const students = await Student.findAll({
		where: {
			parentPhoneNumber: parentPhoneNumber,
		},
	});
	if (!students.length) {
		return res.status(404).json({ message: 'لا يوجد طلاب لهذا الرقم' });
	}

	return res.status(200).json({ students });
});

exports.getStudents = AsyncHandler(async (req, res) => {
	const { firstName, page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const whereCondition = firstName
		? { firstName: { [Op.like]: `%${firstName}%` } }
		: {};

	const students = await Student.findAndCountAll({
		where: whereCondition,
		limit: parseInt(limit),
		offset,
	});

	const totalPages = Math.ceil(students.count / limit);

	res.status(200).json({
		currentPage: page,
		totalPages,
		totalStudents: students.count,
		students: students.rows,
	});
});

exports.getTeachers = AsyncHandler(async (req, res) => {
	const { firstName, page = 1, limit = 10 } = req.query;
	const offset = (page - 1) * limit;

	const whereCondition = firstName
		? { firstName: { [Op.like]: `%${firstName}%` } }
		: {};

	const teachers = await Teacher.findAndCountAll({
		where: whereCondition,
		limit: parseInt(limit),
		offset,
	});

	const totalPages = Math.ceil(teachers.count / limit);

	res.status(200).json({
		currentPage: page,
		totalPages,
		totalTeachers: teachers.count,
		teachers: teachers.rows,
	});
});
