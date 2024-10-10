const express = require('express');

const {
	createEvent,
	getAllEvents,
} = require('../controllers/event.controller');

const userEventRouter = express.Router();
userEventRouter.get('/', getAllEvents);

const adminEventRouter = express.Router();

adminEventRouter.post('/', createEvent);

module.exports = { userEventRouter, adminEventRouter };
