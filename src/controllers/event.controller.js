const { Event } = require('../models');
const AsyncHandler = require('express-async-handler');

exports.createEvent = AsyncHandler(async (req, res) => {
	const { title, description, start, end } = req.body;

	if (req.role !== 'admin') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}
	const event = await Event.create({
		title,
		description,
		start,
		end,
		adminId: req.admin.id,
	});
	res.status(201).json({
		message: 'تم انشاء الحدث بنجاح',
	});
});

exports.getAllEvents = AsyncHandler(async (req, res) => {
	const events = await Event.findAll();
	if (!events || events.length === 0) {
		return res.status(404).json({ error: 'لا يوجد أحداث للعرض' });
	}
	res.status(200).json({ data: events });
});
