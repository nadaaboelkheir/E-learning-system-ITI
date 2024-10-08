const express = require('express');

const {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
	getTeacherLevels,
	getCoursesInLevel,
} = require('../controllers/level.controller');

const router = express.Router();

router.get('/', getAllLevels);
router.delete('/:id', deleteLevel);
router.get('/students/:levelId', getStudentsInLevel);
router.get('/teacher/:teacherId', getTeacherLevels);
router.get('/courses/:levelId', getCoursesInLevel);

module.exports = router;
