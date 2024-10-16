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

				const deviceInfo = req.headers['user-agent'];
				const sessions = await UserSessions.findAll({
					where: { userId: student.id },
				});

				if (sessions.length >= deviceLimit) {
					return res.status(403).json({
						message:
							'لا يمكنك تسجيل دخول الجهاز الخاص بك لأكثر من 4 أجهزة',
					});
				}

				const activeSessions = sessions.filter(
					(session) => session.active,
				);
				if (activeSessions.length >= activeDeviceLimit) {
					return res.status(403).json({
						message:
							'لا يمكنك استخدام أكثر من 3 أجهزة في نفس الوقت',
					});
				}

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
					return res.status(401).json({ error: 'المدرس غير موجود' });
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

const authorize = (role, isEmailVerifiedCheck = false) => {
	return (req, res, next) => {
		if (req.role !== role) {
			return res
				.status(401)
				.json({ message: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		if (isEmailVerifiedCheck && !req[role].isEmailVerified) {
			return res
				.status(401)
				.json({ message: 'البريد الالكتروني غير مفعل' });
		}

		next();
	};
};

exports.authorizeTeacher = authorize('teacher', true);

exports.authorizeStudent = authorize('student', true);

exports.authorizeAdmin = authorize('admin');

exports.authorizeTeacherOrAdmin = (req, res, next) => {
	if (req.role === 'admin') {
		return next();
	}
	return authorize('teacher', true)(req, res, next);
};
