const { Level, Student, Course } = require('../models');
exports.createLevelWithSubLevels = async (req, res) => {
	const { title, subLevels } = req.body;
	try {
		if (req.role !== 'admin') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const existingLevel = await Level.findOne({ where: { title } });
		if (existingLevel) {
			return res.status(400).json({ error: 'المستوى موجود بالفعل' });
		}

		const parentLevel = await Level.create({
			title,
		});

		if (subLevels && Array.isArray(subLevels)) {
			for (const subLevel of subLevels) {
				await Level.create({
					title: subLevel.title,
					parentLevelId: parentLevel.id,
				});
			}
		}

		res.status(201).json({
			message: 'تم انشاء المستوى بنجاح مع المستويات الفرعية',
			parentLevel,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getAllLevels = async (req, res) => {
	try {
		const levels = await Level.findAll({
			attributes: ['id', 'title'],
			where: {
				parentLevelId: null,
			},
			include: [
				{
					model: Level,
					as: 'subLevels',
					attributes: ['id', 'title'],
				},
			],
		});
		if (!levels || levels.length === 0) {
			return res.status(404).json({ error: 'لا يوجد مستويات' });
		}
		res.status(200).json({ count: levels.length, data: levels });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.deleteLevel = async (req, res) => {
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

exports.getMainLevelById = async (req, res) => {
	const { id } = req.params;
	try {
		const level = await Level.findOne({
			where: {
				id,
				parentLevelId: null,
			},
			attributes: ['id', 'title'],
			include: [
				{
					model: Level,
					as: 'subLevels',
					attributes: ['id', 'title'],
				},
			],
		});

		if (!level) {
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}

		res.status(200).json({ data: level });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

exports.getStudentsInLevel = async (req, res) => {
	const { levelId } = req.params;
	console.log('Requested levelId:', levelId);
	try {
		const level = await Level.findOne({
			where: { id: levelId },
			include: {
				model: Student,
				as: 'students',
				attributes: ['id', 'firstName', 'lastName', 'email'],
				where: { isEmailVerified: true },
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

exports.getCoursesInLevel = async (req, res) => {
	const { levelId } = req.params;
	try {
		const level = await Level.findOne({
			where: { id: levelId },
			include: {
				model: Course,
				as: 'courses',
				attributes: ['title'],
			},
		});
		if (!level) {
			return res.status(404).json({ error: 'المستوى غير موجود' });
		}
		if (!level.courses || level.courses.length === 0) {
			return res
				.status(404)
				.json({ error: 'لا يوجد دورات في هذا المستوى' });
		}
		res.status(200).json({
			count: level.courses.length,
			data: level.courses,
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
