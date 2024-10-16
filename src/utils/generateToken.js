const jwt = require('jsonwebtoken');
const { Admin, Student, Teacher } = require('../models');
const { JWT_SECRET, JWT_REFRESH_SECRET, NODE_ENV } = require('../utils/env');
const ACCESS_TOKEN_EXPIRATION = '1m';
const REFRESH_TOKEN_EXPIRATION = '7d';

exports.generateTokenAndSetCookie = async (userId, role, res) => {
	const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, {
		expiresIn: ACCESS_TOKEN_EXPIRATION,
	});
	const refreshToken = jwt.sign({ id: userId, role }, JWT_REFRESH_SECRET, {
		expiresIn: REFRESH_TOKEN_EXPIRATION,
	});

	let user;
	if (role === 'admin') {
		user = await Admin.findOne({ where: { id: userId } });
	} else if (role === 'student') {
		user = await Student.findOne({ where: { id: userId } });
	} else if (role === 'teacher') {
		user = await Teacher.findOne({ where: { id: userId } });
	}

	if (user) {
		user.refreshToken = refreshToken;
		await user.save();

		res.cookie('access-token', accessToken, {
			httpOnly: true,
			secure: NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 1 * 60 * 1000,
		});

		res.cookie('refresh-token', refreshToken, {
			httpOnly: true,
			secure: NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
	}
};

exports.refreshAccessToken = async (req, res) => {
	const refreshToken = req.cookies['refresh-token'];

	if (!refreshToken) {
		return res.status(403).json({ message: 'Refresh token not found.' });
	}

	try {
		const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
		const userId = decoded.id;
		const role = decoded.role;

		let user;
		if (role === 'admin') {
			user = await Admin.findOne({ where: { id: userId } });
		} else if (role === 'student') {
			user = await Student.findOne({ where: { id: userId } });
		} else if (role === 'teacher') {
			user = await Teacher.findOne({ where: { id: userId } });
		}

		if (!user || user.refreshToken !== refreshToken) {
			return res.status(403).json({ message: 'Invalid refresh token.' });
		}

		const newAccessToken = jwt.sign(
			{ id: decoded.id, role: decoded.role },
			JWT_SECRET,
			{
				expiresIn: ACCESS_TOKEN_EXPIRATION,
			},
		);

		res.cookie('access-token', newAccessToken, {
			httpOnly: true,
			secure: NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 1 * 60 * 1000,
		});

		res.status(200).json({
			message: 'Access token refreshed successfully.',
		});
	} catch (err) {
		return res.status(403).json({ message: 'Invalid refresh token.' });
	}
};
