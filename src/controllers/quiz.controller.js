const {
	sequelize,
	Quiz,
	Question,
	Answer,
	QuizAttempt,
	Student,
	Enrollment,
	Course,
	Teacher,
} = require('../models');
const AsyncHandler = require('express-async-handler');

exports.createQuiz = AsyncHandler(async (req, res) => {
	const { title, Duration, sectionId, questions } = req.body;
	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacherId = req.teacher.id;
	const transaction = await sequelize.transaction();

	const quiz = await Quiz.create(
		{
			title,
			Duration,
			sectionId,
			teacherId,
		},
		{ transaction },
	);
	for (const question of questions) {
		const { questionTitle, mark, answers } = question;
		const createdQuestion = await Question.create(
			{
				title: questionTitle,
				mark,
				quizId: quiz.id,
			},
			{ transaction },
		);

		const answerPromises = answers.map((answer) => {
			return Answer.create(
				{
					title: answer.title,
					isCorrect: answer.isCorrect,
					questionId: createdQuestion.id,
				},
				{ transaction },
			);
		});
		await Promise.all(answerPromises);
	}
	await transaction.commit();
	return res.status(201).json(quiz);
});

// student
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
		return res
			.status(403)
			.json({ message: 'حسابك غير مشترك في هذه الدورة' });
	}
	const existingAttempt = await QuizAttempt.findOne({
		where: { studentId, quizId },
	});
	if (existingAttempt) {
		return res.status(403).json({ message: 'لقد قمت بحل الاختبار من قبل' });
	}

	const questions = await Question.findAll({
		where: { quizId },
		include: [{ model: Answer }],
	});

	let totalScore = 0;
	let maxScore = 0;

	for (const question of questions) {
		const studentAnswer = answers.find((a) => a.questionId === question.id);
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

exports.getQuestionsInQuiz = AsyncHandler(async (req, res) => {
	const { id } = req.params;

	const questions = await Question.findAll({
		where: { quizId: id },
		attributes: ['id', 'title', 'mark'],
		include: [
			{
				model: Answer,
				attributes: ['id', 'title', 'isCorrect'],
			},
		],
	});
	return res.status(200).json({ data: questions });
});

exports.getAllQuizzes = AsyncHandler(async (req, res) => {
	const allQuizzes = await Quiz.findAll({
		attributes: ['id', 'title', 'createdAt'],
		include: [
			{
				model: Course,
				as: 'course',
				attributes: ['id', 'title'],
			},
			{
				model: Student,
				as: 'student',
				attributes: ['id', 'firstName', 'lastName'],
			},
			{
				model: Teacher,
				as: 'teacher',
				attributes: ['id', 'firstName', 'lastName'],
			},
		],
	});
	return res.status(200).json({ count: allQuizzes.length, data: allQuizzes });
});

exports.getQuizForSection = AsyncHandler(async (req, res) => {
	const { sectionId } = req.params;

	const quiz = await Quiz.findOne({
		where: { sectionId: sectionId },
		include: [
			{
				model: Question,
				include: [{ model: Answer }],
			},
		],
	});

	if (!quiz) {
		return res
			.status(404)
			.json({ message: 'لا توجد اختبارات متاحة لهذة الوحدة' });
	}

	return res.status(200).json(quiz);
});
