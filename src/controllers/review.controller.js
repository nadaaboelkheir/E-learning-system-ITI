const AsyncHandler = require('express-async-handler');
const { Student, Course, Review, Enrollment } = require('../models');

exports.reviewEnrolledCourseByStudent = AsyncHandler(async (req, res) => {
	const { courseId, rate, comment } = req.body;

	const studentId = req.student.id;
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

exports.deleteReview = AsyncHandler(async (req, res) => {
	const { reviewId } = req.params;

	const review = await Review.findOne({ where: { id: reviewId } });
	if (!review) {
		return res.status(404).json({ message: 'Review not found' });
	}
	await review.destroy();

	return res.status(200).json({
		message: 'تم حذف التقييم بنجاح',
	});
});

exports.updateReview = AsyncHandler(async (req, res) => {
	const { reviewId } = req.params;
	const { rate, comment } = req.body;

	const review = await Review.findOne({ where: { id: reviewId } });
	if (!review) {
		return res.status(404).json({ message: 'Review not found' });
	}
	review.rate = rate || review.rate;
	review.comment = comment || review.comment;
	await review.save();

	return res.status(200).json({
		message: 'تم تحديث التقييم بنجاح',
	});
});
exports.getReviewsMadeByStudent = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const reviews = await Review.findAll({
		where: {
			studentId: studentId,
		},
		include: [
			{
				model: Course,
				attributes: ['id', 'title'],
				include: [
					{
						model: Teacher,
						attributes: ['id', 'firstName', 'lastName'],
					},
				],
			},
		],
	});

	if (reviews.length === 0) {
		return res.status(404).json({ message: 'لا يوجد تقييمات لهذا الطالب' });
	}

	return res.status(200).json({
		message: 'تم التقييم بنجاح',
		data: reviews,
	});
});
