const nodemailer = require('nodemailer');

exports.sendVerificationEmail = async (email, subject, text) => {
	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 587,
		auth: {
			user: 'pgemahmoud@gmail.com',
			pass: 'ryjl vbiu pdil girp',
		},
	});

	const mailOptions = {
		from: 'pgemahmoud@gmail.com',
		to: email,
		subject: subject,
		text: text,
	};

	await transporter.sendMail(mailOptions);
};

exports.generateOtp = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

