const AsyncHandler = require('express-async-handler');
const { Student, QuizAttempt } = require('../models');

exports.calculateStudentEvaluation = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const quizAttempts = await QuizAttempt.findAll({
		where: { studentId },
	});

	if (!quizAttempts || quizAttempts.length === 0) {
		return res
			.status(404)
			.json({ message: 'No quizzes found for this student.' });
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
exports.getStudentsForParent = AsyncHandler(async (req, res) => {
	const { parentPhoneNumber } = req.params;

	if (!parentPhoneNumber) {
		return res
			.status(400)
			.json({ message: 'Parent phone number is required.' });
	}
	const students = await Student.findAll({
		where: {
			parentPhoneNumber: parentPhoneNumber,
		},
	});
	if (!students.length) {
		return res
			.status(404)
			.json({ message: 'No students found for this parent.' });
	}

	return res.status(200).json({ students });
});
exports.getStudentByNationalId = AsyncHandler(async (req, res) => {
	const { nationalId } = req.params;

	const student = await Student.findOne({ where: { nationalId } });
	if (student) {
		const { password, createdAt, updatedAt, refreshToken, ...safeStudent } =
			student.dataValues;
		return res.status(200).json(safeStudent);
	}
	return res.status(404).json({ message: 'هذا الطالب غير موجود' });
});
