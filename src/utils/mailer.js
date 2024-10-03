// const nodemailer = require('nodemailer');
// const { google } = require('googleapis');

// // OAuth2 Client Setup
// const OAuth2 = google.auth.OAuth2;
// const oauth2Client = new OAuth2(
// 	process.env.CLIENT_ID, // Client ID
// 	process.env.CLIENT_SECRET, // Client Secret
// 	process.env.REDIRECT_URL, // Redirect URL
// );

// oauth2Client.setCredentials({
// 	refresh_token: process.env.REFRESH_TOKEN,
// });

// async function sendVerificationEmail(toEmail, verificationCode) {
// 	try {
// 		const accessToken = await oauth2Client.getAccessToken();

// 		const transporter = nodemailer.createTransport({
// 			service: 'gmail',
// 			auth: {
// 				type: 'OAuth2',
// 				user: process.env.EMAIL_USER, // Your Gmail address
// 				clientId: process.env.CLIENT_ID,
// 				clientSecret: process.env.CLIENT_SECRET,
// 				refreshToken: process.env.REFRESH_TOKEN,
// 				accessToken: accessToken.token,
// 			},
// 		});

// 		const mailOptions = {
// 			from: process.env.EMAIL_USER,
// 			to: toEmail,
// 			subject: 'Email Verification Code',
// 			text: `Your verification code is: ${verificationCode}`,
// 		};

// 		const result = await transporter.sendMail(mailOptions);
// 		console.log('Verification email sent to:', toEmail);
// 		return result;
// 	} catch (error) {
// 		console.error('Error sending email:', error);
// 		throw new Error('Could not send verification email.');
// 	}
// }

// module.exports = sendVerificationEmail;

const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, text) => {
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
		text: 'Your OTP is',
	};

	await transporter.sendMail(mailOptions);
};

const generateOtp = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

module.exports = { sendEmail, generateOtp };
