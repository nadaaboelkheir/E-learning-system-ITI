const { body } = require('express-validator');

const studentValidationRules = () => {
	return [
		body('firstName')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال اسم الطالب'),
		body('lastName')
			.trim()
			.notEmpty()
			.withMessage('برجاء ادخال اسم العائلة'),
		body('nationalID')
			.isLength({ min: 14, max: 14 })
			.withMessage('برجاء ادخال الرقم القومي للطالب بشكل صحيح')
			.isNumeric()
			.withMessage('الرقم القومي يجب ان يكون مكون من 14 رقم'),
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
			.withMessage('رقم هاتف الطالب يجب ان يبدأ بـ 010, 011, 012, 015'),
		body('parentPhoneNumber')
			.isLength({ min: 11, max: 11 })
			.withMessage('يرجي ادخال رقم هاتف صحيح')
			.matches(/^01[0,1,2,5][0-9]{8}$/)
			.withMessage('رقم هاتف الاب يجب ان يبدأ بـ 010, 011, 012, 015'),
		body('level')
			.trim()
			.notEmpty()
			.withMessage('يرجي اختيار السنة الدراسية'),
	];
};

module.exports = studentValidationRules;
