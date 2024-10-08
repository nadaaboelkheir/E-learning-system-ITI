const express = require('express');
const {
	createQuiz,
	getQuestionsInQuiz,
	getAllQuizzes,
} = require('../controllers/quiz.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/create-quiz', protectRoute, createQuiz);
router.get('/get-questions/:id', getQuestionsInQuiz);
router.get('/get-all-quizzes', getAllQuizzes);

module.exports = router;
