const express = require('express');

const {
	adminSignup,
	deleteUser,
	getAllTeachers,
	getAllStudents,
	getAllSubjects,
} = require('../controllers/admin.controller');
const { protectRoute } = require('../middlewares/auth.mw');
const { adminLevelRouter } = require('./level.routes');
const {adminEventRouter} = require('./event.routes');

const router = express.Router();

router.post('/signup', adminSignup);
router.delete('/user/:userId', protectRoute, deleteUser);
router.get('/teachers', getAllTeachers);
router.get('/students', getAllStudents);
router.get('/subjects', getAllSubjects);
router.use('/level', protectRoute,adminLevelRouter);
router.use('/event', protectRoute,adminEventRouter);

module.exports = router;
