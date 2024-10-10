const express = require('express');
const { teacherCourseRouter } = require('./course.routes');
const { teacherQuizRouter } = require('./quiz.routes');
const { teacherAuthRouter } = require('./auth.routes');
const router = express.Router();

router.use('/course', teacherCourseRouter);

router.use('/quiz', teacherQuizRouter);

router.use('/auth', teacherAuthRouter);

module.exports = router;
