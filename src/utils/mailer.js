const nodemailer = require('nodemailer');

const sendEmail = async (email, subject, htmlContent) => {
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
		html: htmlContent,
	};

	await transporter.sendMail(mailOptions);
};

exports.sendVerificationEmailToStudent = async (email, subject, otp) => {
	await sendEmail(email, subject, otpHtmlTemplate(otp));
};

exports.sendApprovalEmailToTeacher = async (
	email,
	subject,
	approveTeacherHtml,
) => {
	await sendEmail(email, subject, approveTeacherHtml);
};

exports.sendRefuseEmailToTeacher = async (
	email,
	subject,
	declineTeacherHtml,
) => {
	await sendEmail(email, subject, declineTeacherHtml);
};

exports.sendApprovalCourseToTeacher = async (
	email,
	subject,
	approveCourseHtml,
) => {
	await sendEmail(email, subject, approveCourseHtml);
};

exports.sendRefuseCourseToTeacher = async (
	email,
	subject,
	declineCourseHtml,
) => {
	await sendEmail(email, subject, declineCourseHtml);
};

exports.generateOtp = () => {
	return Math.floor(100000 + Math.random() * 900000);
};

const otpHtmlTemplate = (otp) => `
   <!doctype html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<title></title>
		<style>
			body {
				margin: 0;
				padding: 0;
				font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
				color: #333;
				background-color: #fff;
			}

			.container {
				margin: 0 auto;
				width: 100%;
				max-width: 600px;
				padding: 0 0px;
				padding-bottom: 10px;
				border-radius: 5px;
				line-height: 1.8;
				direction: rtl;
				text-align: right;
			}

			.header {
				border-bottom: 1px solid #eee;
			}

			.header a {
				font-size: 1.4em;
				color: #000;
				text-decoration: none;
				font-weight: 600;
			}

			.content {
				min-width: 700px;
				overflow: auto;
				line-height: 2;
			}

			.otp {
				background: linear-gradient(
					to right,
					#00c6ff 0,
					#0072ff 50%,
					#00c6ff 100%
				);
				margin: 0 auto;
				width: 70%;
				padding: 0 10px;
				color: #fff;
				border-radius: 4px;
				text-align: center;
				font-weight: 600;
				font-size: 1.8em;
			}

			.footer {
				color: #aaa;
				font-size: 0.8em;
				line-height: 1;
				font-weight: 300;
			}

			.email-info {
				color: #666666;
				font-weight: 400;
				font-size: 13px;
				line-height: 18px;
				padding-bottom: 6px;
			}

			.email-info a {
				text-decoration: none;
				color: #00bc69;
			}

			p {
				font-size: 15px;
				line-height: 30px;
			}
		</style>
	</head>

	<body>
		<div class="container">
			<div class="header">
				<a>اثبات هوية علي منصة ذاكرلي</a>
			</div>
			<br />
			<p>
				لقد تلقينا طلب تسجيل الدخول إلى حسابك في منصة ذاكرلي. لأسباب
				أمنية، يرجى التحقق من هويتك عن طريق تقديم رمز التحقق المؤقت
				(OTP) التالي.
				<br />
				<b>رمز التحقق المؤقت (OTP) الخاص بك هو:</b>
			</p>
			<h1 class="otp">${otp}</h1>
			<p style="font-size: 0.9em">
				<strong>رمز التحقق المؤقت (OTP) صالح لمدة 3 دقائق.</strong>
				<br /><br />
				إذا لم تقم بطلب هذا الدخول، يرجى تجاهل هذه الرسالة. يرجى التأكد
				من سرية رمز التحقق وعدم مشاركته مع أي شخص.
				<br />
				<strong>لا تقم بمشاركة أو إرسال هذا الرمز لأي شخص.</strong>
				<br /><br />
				<strong>شكرًا لاستخدامك ذاكرلي</strong>
				<br />
			</p>

			<hr style="border: none; border-top: 0.5px solid #131111" />
			<div class="footer">
				<p>لا يمكن الرد على هذا البريد الإلكتروني.</p>
				<p>
					لمزيد من المعلومات حول منصة ذاكرلي قم بزيارة
					<strong>[الاسم]</strong>
				</p>
			</div>
		</div>
	</body>
</html>
`;

exports.approveTeacherHtml = `
    <!doctype html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f4f4f4;
				margin: 0;
				padding: 0;
			}
			.email-container {
				background-color: #ffffff;
				max-width: 600px;
				margin: 30px auto;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
			}
			h1 {
				color: #333;
				text-align: center;
			}
			p {
				font-size: 16px;
				color: #555;
				line-height: 1.5;
				text-align: right;
			}
			.cta-button {
				text-decoration: none;
				display: block;
				width: 100%;
				max-width: 200px;
				margin: 20px auto;
				padding: 10px;
				background-color: #fff;
				color: white;
				text-align: center;
				text-decoration: none;
				font-size: 18px;
				border-radius: 5px;
				border: 2px solid #00bc69;
				transition: background-color 0.5ms ease;
			}
			.cta-button:hover {
				background-color: #00bc69;
				color: #fff;
			}
		</style>
	</head>
	<body dir="rtl">
		<div class="email-container">
			<h1>مبروك! تم تفعيل حسابك</h1>
			<p>
				تهانينا لقد تم تفعيل حسابك كمدرس على منصتنا من قبل الإدارة. الآن
				يمكنك تسجيل الدخول والاستفادة من خدماتنا التعليمية.
			</p>
			<p>
				نحن متحمسون لانضمامك إلينا ونتطلع إلى أن تكون جزءًا من فريق
				التدريس لدينا. استخدم الرابط أدناه لتسجيل الدخول إلى حسابك.
			</p>
			<a href="https://yourwebsite.com/login" class="cta-button"
				>تسجيل الدخول</a
			>
			<p>إذا كان لديك أي استفسارات، لا تتردد في الاتصال بنا.</p>
		</div>
	</body>
</html>
`;

exports.declineTeacherHtml = `
    <!doctype html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f4f4f4;
				margin: 0;
				padding: 0;
			}
			.email-container {
				background-color: #ffffff;
				max-width: 600px;
				margin: 30px auto;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
				text-align: center;
			}
			h1 {
				color: #333;
				text-align: center;
				font-size: 24px;
			}
			p {
				font-size: 16px;
				color: #555;
				line-height: 1.5;
				text-align: right;
			}
			.cta-button {
				text-decoration: none;
				display: block;
				width: 100%;
				max-width: 200px;
				margin: 20px auto;
				padding: 10px;
				background-color: #fff;
				color: white;
				text-align: center;
				font-size: 18px;
				border-radius: 5px;
				border: 2px solid #d9534f;
				transition: background-color 0.5ms ease;
			}
			.cta-button:hover {
				background-color: #d9534f;
				color: #fff;
			}
			.emoji {
				font-size: 50px;
				margin-top: 20px;
				color: #d9534f;
			}
		</style>
	</head>
	<body dir="rtl">
		<div class="email-container">
			<h1>نأسف! لم يتم قبول طلبك</h1>
			<div class="emoji">😔</div>
			<p>
				نحن نقدر اهتمامك بالانضمام إلى فريق التدريس لدينا، ولكن بعد مراجعة
				ملفك الشخصي، نأسف لإبلاغك بأنه لم يتم قبول طلبك كمدرس في هذه
				المرحلة.
			</p>
			<p>
				نوصي بمراجعة متطلباتنا والتقدم مرة أخرى في المستقبل إذا كنت
				مهتمًا. شكراً لتفهمك.
			</p>
			<p>إذا كان لديك أي استفسارات، لا تتردد في الاتصال بنا.</p>
		</div>
	</body>
</html>
`;

exports.approveCourseHtml = `
	<!doctype html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f4f4f4;
				margin: 0;
				padding: 0;
			}
			.email-container {
				background-color: #ffffff;
				max-width: 600px;
				margin: 30px auto;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
				text-align: center;
			}
			h1 {
				color: #333;
				text-align: center;
				font-size: 24px;
			}
			p {
				font-size: 16px;
				color: #555;
				line-height: 1.5;
				text-align: right;
			}
			.cta-button {
				text-decoration: none;
				display: block;
				width: 100%;
				max-width: 200px;
				margin: 20px auto;
				padding: 10px;
				background-color: #fff;
				color: white;
				text-align: center;
				font-size: 18px;
				border-radius: 5px;
				border: 2px solid #5cb85c;
				transition: background-color 0.5ms ease;
			}
			.cta-button:hover {
				background-color: #5cb85c;
				color: #fff;
			}
			.emoji {
				font-size: 50px;
				margin-top: 20px;
				color: #5cb85c;
			}
		</style>
	</head>
	<body dir="rtl">
		<div class="email-container">
			<h1>تم قبول طلبك</h1>
			<div class="emoji">😊</div>
			<p>
				تهانينا لقد تم قبول طلب اضافة دورتك الجديدة علي المنصة بنجاح
			</p>
			<p>
				شكرا لاضافتك هذة الدورة الجديدة. يمكنك اضافة المزيد من الدورات للمنصة
				باستخدام الرابط أدناه
			</p>
			<p>إذا كان لديك أي استفسارات، لا تتردد في الاتصال بنا.</p>
		</div>
	</body>
</html>
`;

exports.declineCourseHtml = `
	<!doctype html>
<html lang="ar">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<style>
			body {
				font-family: Arial, sans-serif;
				background-color: #f4f4f4;
				margin: 0;
				padding: 0;
			}
			.email-container {
				background-color: #ffffff;
				max-width: 600px;
				margin: 30px auto;
				padding: 20px;
				border-radius: 10px;
				box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
				text-align: center;
			}
			h1 {
				color: #333;
				text-align: center;
				font-size: 24px;
			}
			p {
				font-size: 16px;
				color: #555;
				line-height: 1.5;
				text-align: right;
			}
			.cta-button {
				text-decoration: none;
				display: block;
				width: 100%;
				max-width: 200px;
				margin: 20px auto;
				padding: 10px;
				background-color: #fff;
				color: white;
				text-align: center;
				font-size: 18px;
				border-radius: 5px;
				border: 2px solid #5cb85c;
				transition: background-color 0.5ms ease;
			}
			.cta-button:hover {
				background-color: #5cb85c;
				color: #fff;
			}
			.emoji {
				font-size: 50px;
				margin-top: 20px;
				color: #5cb85c;
			}
		</style>
	</head>
	<body dir="rtl">
		<div class="email-container">
			<h1>تم رفض طلبك</h1>
			<div class="emoji">😔</div>
			<p>
				نأسف لقد تم رفض طلب اضافة دورتك الجديدة علي المنصة
			</p>
			<p>
				نوصي بمراجعة متطلباتنا والتقدم مرة أخرى في المستقبل إذا كنت
				مهتمًا. شكراً لتفهمك.
			</p>
			<p>إذا كان لديك أي استفسارات، لا تتردد في الاتصال بنا.</p>
		</div>
	</body>
</html>
`;
