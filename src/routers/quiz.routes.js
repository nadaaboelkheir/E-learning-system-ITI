const express = require('express');
const { createQuiz } = require('../controllers/quiz.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/create-quiz', protectRoute, createQuiz);

module.exports = router;
