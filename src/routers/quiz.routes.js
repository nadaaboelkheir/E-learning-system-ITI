const express = require('express');
const { createQuiz ,takeQuiz,getStudentQuizzes} = require('../controllers/quiz.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const teacherQuizRouter = express.Router();

teacherQuizRouter.post('/', protectRoute, createQuiz);


const studentQuizRouter=express.Router();
studentQuizRouter.post('/take-quiz', takeQuiz);
studentQuizRouter.get('/quizzes/:studentId', getStudentQuizzes);

module.exports = {teacherQuizRouter ,studentQuizRouter};
