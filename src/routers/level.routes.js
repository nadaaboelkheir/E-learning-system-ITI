const express = require('express');

const {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
	getMainLevelById,
	createLevelWithSubLevels,
} = require('../controllers/level.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const userLevelRouter = express.Router();

userLevelRouter.get('/', getAllLevels);
const adminLevelRouter = express.Router();
adminLevelRouter.post('/',  protectRoute,createLevelWithSubLevels);
adminLevelRouter.delete('/:id',protectRoute, deleteLevel);
adminLevelRouter.get('/students/:levelId',protectRoute, getStudentsInLevel);
adminLevelRouter.get('/:id',protectRoute, getMainLevelById);

module.exports = {userLevelRouter, adminLevelRouter};
