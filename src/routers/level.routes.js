const express = require('express');

const { getAllLevels } = require('../controllers/level.controller');

const router = express.Router();

router.get('/', getAllLevels);

module.exports = router;
