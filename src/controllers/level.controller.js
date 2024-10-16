const { Level, Student, Course, Teacher } = require('../models');
const AsyncHandler = require('express-async-handler');

exports.createLevelWithSubLevels = AsyncHandler(async (req, res) => {
	const { title, subLevels } = req.body;

	if (req.role !== 'admin') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
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
});

exports.getAllLevels = AsyncHandler(async (req, res) => {
	const levels = await Level.findAll({
		attributes: ['id', 'title', 'createdAt', 'updatedAt'],
		where: {
			parentLevelId: null,
		},
		include: [
			{
				model: Level,
				as: 'subLevels',
				attributes: ['id', 'title', 'createdAt', 'updatedAt'],
				include: [
					{
						model: Course,
						as: 'courses',
						attributes: ['id', 'title'],
					},
				],
			},
		],
		order: [
			['title', 'ASC'],
			[{ model: Level, as: 'subLevels' }, 'title', 'ASC'],
			[
				{ model: Level, as: 'subLevels' },
				{ model: Course, as: 'courses' },
				'title',
				'ASC',
			],
		],
	});

	if (!levels || levels.length === 0) {
		return res.status(404).json({ error: 'لا يوجد مستويات' });
	}

	res.status(200).json({ count: levels.length, data: levels });
});

exports.deleteLevel = AsyncHandler(async (req, res) => {
	const { id } = req.params;

	const level = await Level.findByPk(id);
	if (!level) {
		return res.status(404).json({ error: 'المستوى غير موجود' });
	}

	await level.destroy();
	res.status(200).json({ message: 'تم حذف المستوى بنجاح' });
});

exports.getMainLevelById = AsyncHandler(async (req, res) => {
	const { id } = req.params;

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
});

exports.getStudentsInLevel = AsyncHandler(async (req, res) => {
	const { levelId } = req.params;

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
		return res.status(404).json({ error: 'لا يوجد طلاب في هذا المستوى' });
	}
	res.status(200).json({
		count: level.students.length,
		data: level.students,
	});
});

exports.getCoursesInLevel = AsyncHandler(async (req, res) => {
	const { levelId } = req.params;

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
		return res.status(404).json({ error: 'لا يوجد دورات في هذا المستوى' });
	}
	res.status(200).json({
		count: level.courses.length,
		data: level.courses,
	});
});

exports.getTeacherLevels = AsyncHandler(async (req, res) => {
	const { teacherId } = req.params;

	const teacher = await Teacher.findOne({ where: { id: teacherId } });

	if (!teacher) {
		return res.status(404).json({ error: 'المدرس غير موجود' });
	}

	const teacherCourses = await Course.findAll({
		where: { teacherId },
		include: [
			{
				model: Level,
				attributes: ['id', 'title'],
				as: 'level',
			},
		],
	});

	if (!teacherCourses || teacherCourses.length === 0) {
		return res.status(404).json({ error: 'لا توجد دورات لهذا المدرس' });
	}

	const levels = teacherCourses
		.map((course) => course.level)
		.filter((level) => level);

	if (levels.length === 0) {
		return res
			.status(404)
			.json({ error: 'لا توجد دورات بها مستويات لهذا المدرس' });
	}

	res.status(200).json({
		count: levels.length,
		data: levels,
	});
});
