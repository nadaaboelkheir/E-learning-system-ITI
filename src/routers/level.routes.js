const express = require('express');

const {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
	getCoursesInLevel,
	getMainLevelById,
	createLevelWithSubLevels,
	getTeacherLevels,
} = require('../controllers/level.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const router = express.Router();
const userLevelRouter = express.Router();

userLevelRouter.get('/', getAllLevels);
userLevelRouter.get('/teacher/:teacherId', protectRoute, getTeacherLevels);
const adminLevelRouter = express.Router();
adminLevelRouter.post('/', protectRoute, createLevelWithSubLevels);
adminLevelRouter.delete('/:id', protectRoute, deleteLevel);
adminLevelRouter.get('/students/:levelId', protectRoute, getStudentsInLevel);
userLevelRouter.get('/courses/:levelId', getCoursesInLevel);
adminLevelRouter.get('/:id', protectRoute, getMainLevelById);

module.exports = { userLevelRouter, adminLevelRouter, router };
