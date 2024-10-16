const AsyncHandler = require('express-async-handler');
const { Student, QuizAttempt, Course, Quiz } = require('../models');

exports.calculateStudentEvaluation = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}
	let totalScore = 0;
	let maxScore = 0;
	let grade = 'F';

	const quizAttempts = await QuizAttempt.findAll({
		where: { studentId },
	});

	if (!quizAttempts || quizAttempts.length === 0) {
		return res.status(404).json({
			message: 'لا توجد اختبارات من قبلك',
			totalScore,
			maxScore,
			grade,
		});
	}

	quizAttempts.forEach((attempt) => {
		totalScore += attempt.score;
		maxScore += attempt.maxScore;
	});

	const percentage = (totalScore / maxScore) * 100;

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
		include: [
			{
				model: Course,
				as: 'courses',
			},
			{
				model: QuizAttempt,
				as: 'quizAttempts',
				include: [
					{
						model: Quiz,
					},
				],
			},
		],
	});

	if (!students.length) {
		return res.status(404).json({ message: 'لا يوجد طلاب لهذا الرقم' });
	}

	return res.status(200).json({ students });
});
