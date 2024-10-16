const express = require('express');
const {
	createEvent,
	getAllEvents,
} = require('../controllers/event.controller');

const { protectRoute, authorizeAdmin } = require('../middlewares/auth.mw');

const userEventRouter = express.Router();
userEventRouter.get('/', getAllEvents);

const adminEventRouter = express.Router();

adminEventRouter.post('/', protectRoute, authorizeAdmin, createEvent);

module.exports = { userEventRouter, adminEventRouter };
