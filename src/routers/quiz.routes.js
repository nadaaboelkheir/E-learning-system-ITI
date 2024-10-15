const express = require('express');
const {
	createQuiz,
	getQuestionsInQuiz,
	getAllQuizzes,
	takeQuiz,
	getStudentQuizzes,
	getQuizForSection,
} = require('../controllers/quiz.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const teacherQuizRouter = express.Router();

teacherQuizRouter.post('/', protectRoute, createQuiz);

const studentQuizRouter = express.Router();
studentQuizRouter.post('/take-quiz', takeQuiz);
studentQuizRouter.get('/quizzes', protectRoute, getStudentQuizzes);
studentQuizRouter.get('/questions/:id', getQuestionsInQuiz);
studentQuizRouter.get('/questions/section/:sectionId', getQuizForSection);
const adminQuizRouter = express.Router();
adminQuizRouter.get('/all-quizzes', getAllQuizzes);

module.exports = { teacherQuizRouter, studentQuizRouter, adminQuizRouter };
