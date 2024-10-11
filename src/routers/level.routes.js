const express = require('express');

const {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
	getCoursesInLevel,
	getMainLevelById,
	createLevelWithSubLevels,
} = require('../controllers/level.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const router = express.Router();
const userLevelRouter = express.Router();

userLevelRouter.get('/', getAllLevels);
const adminLevelRouter = express.Router();
adminLevelRouter.post('/', protectRoute, createLevelWithSubLevels);
adminLevelRouter.delete('/:id', protectRoute, deleteLevel);
adminLevelRouter.get('/students/:levelId', protectRoute, getStudentsInLevel);
router.get('/teacher/:teacherId', getTeacherLevels);
router.get('/courses/:levelId', getCoursesInLevel);
adminLevelRouter.get('/:id', protectRoute, getMainLevelById);

module.exports = { userLevelRouter, adminLevelRouter, router };
