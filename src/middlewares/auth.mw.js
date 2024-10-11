const jwt = require('jsonwebtoken');
const { Teacher } = require('../models');
const { JWT_SECRET } = require('../utils/env');

exports.protectRoute = async (req, res, next) => {
	const token =
		req.cookies['access-token'] ||
		(req.headers.authorization ? req.headers.authorization.split(' ')[1] : null);

	if (!token) {
		return res.status(401).json({ error: 'لا تستطيع الوصول لهذه الصفحة' });
	}

	jwt.verify(token, JWT_SECRET, async (err, decoded) => {
		if (err) {
			if (err.message === 'jwt expired') {
				return res.status(401).json({ error: 'تم انتهاء الصلاحية' });
			}
			return res.status(401).json({ error: err.message });
		}

		req.userId = decoded.id;
		req.role = decoded.role;

		if (decoded.role === 'admin') {
			req.admin = { id: decoded.id, role: decoded.role };
		} else if (decoded.role === 'student') {
			req.student = { id: decoded.id, role: decoded.role };
		} else if (decoded.role === 'teacher') {
			try {
				const teacher = await Teacher.findOne({
					where: { id: decoded.id },
					attributes: ['id', 'role', 'isEmailVerified'],
				});
				if (!teacher) {
					return res.status(401).json({ error: 'Teacher not found' });
				}
				req.teacher = teacher;
			} catch (error) {
				return res.status(500).json({ error: 'Internal server error' });
			}
		}

		next();
	});
};
