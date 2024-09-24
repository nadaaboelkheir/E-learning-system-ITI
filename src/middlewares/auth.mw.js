const jwt = require('jsonwebtoken');

const protectRoute = async (req, res, next) => {
	const token = req.cookies['access-token'];
	if (!token) {
		return res.status(401).json({ error: 'لا تستطيع الوصول لهذه الصفحة' });
	}
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.userId = decoded.id;
		req.role = decoded.role;

		// check token invalid or not
		if (decoded.role === 'admin') {
			req.admin = { id: decoded.id, role: decoded.role };
		} else if (decoded.role === 'student') {
			req.student = { id: decoded.id, role: decoded.role };
		} else if (decoded.role === 'teacher') {
			req.teacher = { id: decoded.id, role: decoded.role };
		}

		next();
	} catch (error) {
		return res.status(401).json({ error: 'Internal server error' });
	}
};

module.exports = { protectRoute };
