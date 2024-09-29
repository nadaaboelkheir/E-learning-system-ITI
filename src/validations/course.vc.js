const { body } = require('express-validator');

const courseValidationRules = () => {
	return [
		body('title').trim().notEmpty().withMessage('برجاء ادخال عنوان الدورة'),
		body('description')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال وصف الدورة'),
		body('levelId').notEmpty().withMessage('برجاء اختيار مستوى الدورة'),
		body('price')
			.notEmpty()
			.isNumeric()
			.withMessage('برجاء ادخال سعر الدورة'),
	];
};

module.exports = courseValidationRules;
