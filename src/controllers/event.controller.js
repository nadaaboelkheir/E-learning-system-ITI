const { Event } = require('../models');

exports.createEvent = async (req, res) => {
	const { title, description, start, end } = req.body;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}
		const event = await Event.create({
			title,
			description,
			start,
			end,
		});
		res.status(201).json({
			message: 'تم انشاء الحدث بنجاح',
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllEvents = async (req, res) => {
	try {
		const events = await Event.findAll();
		if (!events || events.length === 0) {
			return res.status(404).json({ error: 'لا يوجد أحداث للعرض' });
		}
		res.status(200).json({ data: events });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};