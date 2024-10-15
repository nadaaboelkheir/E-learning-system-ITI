const AsyncHandler = require('express-async-handler');
const { Student, Course, Review, Enrollment } = require('../models');

exports.getCourseReviews = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'Course not found' });
	}

	const reviews = await Review.findAll({
		where: {
			courseId: courseId,
		},
		include: [
			{ model: Student, attributes: ['id', 'firstName', 'lastName'] },
		],
	});

	if (reviews.length === 0) {
		return res
			.status(404)
			.json({ message: 'No reviews found for this course.' });
	}

	return res.status(200).json({
		message: 'Reviews retrieved successfully.',
		reviews: reviews,
	});
});

exports.getCourseRating = AsyncHandler(async (req, res) => {
	const { courseId } = req.params;

	const reviews = await Review.findAll({
		where: { courseId },
		attributes: ['rate'],
	});

	if (!reviews || reviews.length === 0) {
		return res
			.status(404)
			.json({ message: 'No reviews found for this course.' });
	}

	const totalRating = reviews.reduce((sum, review) => sum + review.rate, 0);
	const averageRating = totalRating / reviews.length;

	res.status(200).json({
		courseId,
		averageRating: averageRating.toFixed(2),
		totalReviews: reviews.length,
	});
});

exports.getTeacherRatingFromCourses = AsyncHandler(async (req, res) => {
	const teacherId = req.params.teacherId || req.teacher.id;

	const courses = await Course.findAll({
		where: { teacherId },
		attributes: ['id'],
	});

	if (!courses || courses.length === 0) {
		return res.status(404).json({ message: 'لا يوجد دورات لهذا المدرس' });
	}

	let totalRating = 0;
	let totalReviews = 0;

	for (const course of courses) {
		const reviews = await Review.findAll({
			where: { courseId: course.id },
			attributes: ['rate'],
		});

		if (reviews.length > 0) {
			const courseTotalRating = reviews.reduce(
				(sum, review) => sum + review.rate,
				0,
			);
			const courseAverageRating = courseTotalRating / reviews.length;

			totalRating += courseAverageRating;
			totalReviews += 1;
		}
	}

	if (totalReviews === 0) {
		return res.status(404).json({
			message: 'لا يوجد تقييمات لهذا المدرس',
		});
	}

	const teacherRating = totalRating / totalReviews;

	res.status(200).json({
		teacherId,
		teacherRating: teacherRating.toFixed(2),
		totalCourses: totalReviews,
	});
});

exports.reviewEnrolledCourseByStudent = AsyncHandler(async (req, res) => {
	const { studentId, courseId, rate, comment } = req.body;
	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}
	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'الدورة غير موجودة' });
	}
	const enrollment = await Enrollment.findOne({
		where: {
			studentId: studentId,
			courseId: courseId,
		},
	});

	if (!enrollment) {
		return res.status(403).json({ message: 'انت غير مشترك في هذه الدورة' });
	}
	const review = await Review.create({
		studentId: student.id,
		courseId: course.id,
		rate,
		comment,
	});

	return res.status(200).json({
		message: 'تم تقييم الدورة بنجاح',
		review,
	});
});

exports.getReviewsMadeByStudent = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const reviews = await Review.findAll({
		where: {
			studentId: studentId,
		},
		include: [{ model: Course, attributes: ['id', 'title'] }],
	});

	if (reviews.length === 0) {
		return res.status(404).json({ message: 'لا يوجد تقييمات لهذا الطالب' });
	}

	return res.status(200).json({
		message: 'تم التقييم بنجاح',
		reviews: reviews,
	});
});
