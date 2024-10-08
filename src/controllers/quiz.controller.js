const {
	sequelize,
	Quiz,
	Question,
	Answer,
	Course,
	Student,
	Teacher,
} = require('../models');

const createQuiz = async (req, res) => {
	const { title, Duration, sectionId, questions } = req.body;
	if (req.role !== 'teacher') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const teacherId = req.teacher.id;
	const transaction = await sequelize.transaction();
	try {
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
	} catch (error) {
		await transaction.rollback();
		return res.status(500).json({ error: error.message });
	}
};

const getQuestionsInQuiz = async (req, res) => {
	const { id } = req.params;
	try {
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
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

const getAllQuizzes = async (req, res) => {
	try {
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
		return res
			.status(200)
			.json({ count: allQuizzes.length, data: allQuizzes });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

module.exports = { createQuiz, getQuestionsInQuiz, getAllQuizzes };
