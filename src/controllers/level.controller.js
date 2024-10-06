const { Level, Student, Teacher, Course } = require('../models');

const getAllLevels = async (req, res) => {
	try {
		const levels = await Level.findAll({
			attributes: ['id', 'title'],
		});
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
				attributes: ['id', 'firstName', 'lastName', 'email'],
			},
		});
		if (!level) {
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}
		if (!level.students || level.students.length === 0) {
			return res
				.status(404)
				.json({ error: 'لا يوجد طلاب في هذا المستوى' });
		}
		res.status(200).json({
			count: level.students.length,
			data: level.students,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

const getTeacherLevels = async (req, res) => {
	const { teacherId } = req.params;

	try {
		// Check if the teacher exists
		const teacher = await Teacher.findOne({ where: { id: teacherId } });
		if (!teacher) {
			return res.status(404).json({ error: 'المدرس غير موجود' });
		}

		// Find all distinct levels the teacher is teaching, using the courses they are associated with
		const levels = await Level.findAll({
			include: [
				{
					model: Course,
					where: { teacherId }, // Match courses by teacher ID
					attributes: [], // We only care about levels, so no need to return course details
				},
			],
			attributes: ['id', 'title'], // You can select specific attributes to return
			distinct: true, // Ensure unique levels
		});

		// If no levels are found, return a message
		if (!levels || levels.length === 0) {
			return res
				.status(404)
				.json({ error: 'لا توجد مستويات مرتبطة بهذا المدرس' });
		}

		// Return the levels
		return res.status(200).json({ count: levels.length, data: levels });
	} catch (error) {
		return res.status(500).json({ error: error.message });
	}
};

module.exports = { getTeacherLevels };

module.exports = {
	getAllLevels,
	deleteLevel,
	getStudentsInLevel,
	getTeacherLevels,
};
