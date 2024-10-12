const jwt = require('jsonwebtoken');
const { Teacher, Student, UserSessions } = require('../models');
const { JWT_SECRET } = require('../utils/env');
const { deviceLimit, activeDeviceLimit } = require('../utils/helperFunctions');

exports.protectRoute = async (req, res, next) => {
	const token =
		req.cookies['access-token'] ||
		(req.headers.authorization
			? req.headers.authorization.split(' ')[1]
			: null);

	if (!token) {
		return res.status(401).json({ error: 'لا تستطيع الوصول لهذه الصفحة' });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);

		jwt.verify(token, JWT_SECRET, async (err, decoded) => {
			if (err) {
				if (err.message === 'jwt expired') {
					return res
						.status(401)
						.json({ error: 'تم انتهاء الصلاحية' });
				}
				return res.status(401).json({ error: err.message });
			}

			req.userId = decoded.id;
			req.role = decoded.role;

			if (decoded.role === 'student') {
				const student = await Student.findByPk(decoded.id);
				if (!student) {
					return res
						.status(401)
						.json({ error: 'المستخدم غير موجود' });
				}
				req.student = student;

				// Track device access
				const deviceInfo = req.headers['user-agent'];
				const sessions = await UserSessions.findAll({
					where: { userId: student.id },
				});

				// Check if the device limit is reached
				if (sessions.length >= deviceLimit) {
					return res.status(403).json({
						message:
							'لا يمكنك تسجيل دخول الجهاز الخاص بك لأكثر من 4 أجهزة',
					});
				}

				// Check how many devices are currently active
				const activeSessions = sessions.filter(
					(session) => session.active,
				); // Assuming you have a way to track active sessions
				if (activeSessions.length >= activeDeviceLimit) {
					return res.status(403).json({
						message:
							'لا يمكنك استخدام أكثر من 3 أجهزة في نفس الوقت',
					});
				}

				// Check if the device is already registered
				const existingSession = sessions.find(
					(session) => session.deviceInfo === deviceInfo,
				);
				if (!existingSession) {
					await UserSessions.create({
						userId: student.id,
						deviceInfo,
						active: true,
					});
				}
			} else if (decoded.role === 'teacher') {
				const teacher = await Teacher.findOne({
					where: { id: decoded.id },
					attributes: ['id', 'role', 'isEmailVerified'],
				});
				if (!teacher) {
					return res.status(401).json({ error: 'Teacher not found' });
				}
				req.teacher = teacher;
			} else if (decoded.role === 'admin') {
				req.admin = { id: decoded.id, role: decoded.role };
			}

			next();
		});
	} catch (err) {
		return res.status(401).json({ error: err.message });
	}
};
