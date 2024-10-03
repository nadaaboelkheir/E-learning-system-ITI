const { body } = require('express-validator');

const teacherValidationRules = () => {
	return [
		body('firstName')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال اسم المدرس'),
		body('lastName')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال اسم العائلة'),
		body('email')
			.isEmail()
			.withMessage('برجاء ادخال بريد الكتروني صحيح')
			.trim(),
		body('password')
			.matches(/^(?=.*[a-z])(?=.*[A-Z]).{8,}$/)
			.withMessage(
				'يجب ان يكون الرقم السري الذي تم ادخاله مكون من 8 ارقام ويجب ان يحتوي علي حروف كبيرة وصغيرة',
			),
		body('phoneNumber')
			.isLength({ min: 11, max: 11 })
			.withMessage('يرجي ادخال رقم هاتف صحيح')
			.matches(/^01[0,1,2,5][0-9]{8}$/)
			.withMessage('رقم هاتف المدرس يجب ان يبدأ بـ 010, 011, 012, 015'),
		body('specialization')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال التخصص'),
		body('graduationYear')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال السنة الدراسية'),
		body('educationalQualification')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال المؤهل الدراسي'),
	];
};

module.exports = teacherValidationRules;
