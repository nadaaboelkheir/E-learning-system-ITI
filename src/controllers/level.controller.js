const { Level } = require('../models');

const getAllLevels = async (req, res) => {
	try {
		const levels = await Level.findAll();
		if (!levels || levels.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مستويات' });
		}
		res.status(200).json({ data: levels });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getAllLevels,
};
