const express = require('express');

const { adminSignup } = require('../controllers/admin.controller');

const router = express.Router();

router.post('/signup', adminSignup);

module.exports = router;
