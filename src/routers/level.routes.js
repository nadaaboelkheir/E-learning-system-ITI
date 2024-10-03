const express = require('express');

const {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
} = require('../controllers/level.controller');

const router = express.Router();

router.get('/', getAllLevels);
router.delete('/:id', deleteLevel);
router.get('/students/:levelId', getStudentsInLevel);

module.exports = router;
