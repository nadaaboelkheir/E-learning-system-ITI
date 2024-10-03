const { Level, Student } = require('../models');

const getAllLevels = async (req, res) => {
	try {
		const levels = await Level.findAll();
		if (!levels || levels.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مستويات' });
		}
		res.status(200).json({ count: levels.length, data: levels });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const deleteLevel = async (req, res) => {
	const { id } = req.params;
	try {
		const level = await Level.findByPk(id);
		if (!level) {
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}
		await level.destroy();
		res.status(200).json({ message: 'تم حذف المستوى بنجاح' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getStudentsInLevel = async (req, res) => {
	const { levelId } = req.params;
	try {
		const level = await Level.findOne({
			where: { id: levelId },
			include: {
				model: Student,
				as: 'students',
			},
		});
		if (!level) {
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}
		res.status(200).json({ data: level.students });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

module.exports = {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
};
