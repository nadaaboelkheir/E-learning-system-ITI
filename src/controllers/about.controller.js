const { About, AboutItems } = require('../models');

exports.getAllCarousels = async (req, res) => {
	try {
		const about = await About.findAll({
			include: [{ model: AboutItems, as: 'items' }],
		});

		return res.status(200).json(about);
	} catch (error) {
		console.error(error);
		return res
			.status(500)
			.json({ error: 'Failed to fetch carousel sections' });
	}
};
