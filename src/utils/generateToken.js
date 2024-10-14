const jwt = require('jsonwebtoken');
const { Admin, Student, Teacher } = require('../models');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../utils/env');

exports.generateTokenAndSetCookie = async (userId, role, res) => {
	const accessToken = jwt.sign({ id: userId, role }, JWT_SECRET, {
		expiresIn: '1h',
	});
	const refreshToken = jwt.sign({ id: userId }, JWT_REFRESH_SECRET, {
		expiresIn: '7d',
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
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 60 * 60 * 1000,
		});

		res.cookie('refresh-token', refreshToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
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
		const decoded = jwt.verify(
			refreshToken,
			process.env.JWT_REFRESH_SECRET,
		);
		const userId = decoded.id;
		const role = decoded.role;

		// Find the user by ID and role, check if the stored refresh token matches
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

		// Generate new access token
		const newAccessToken = jwt.sign(
			{ id: decoded.id, role: decoded.role },
			process.env.JWT_SECRET,
			{
				expiresIn: '1h',
			},
		);

		res.cookie('access-token', newAccessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV !== 'development',
			sameSite: 'strict',
			maxAge: 1 * 60 * 60 * 1000, // 1 hour
		});

		res.status(200).json({
			message: 'Access token refreshed successfully.',
		});
	} catch (err) {
		return res.status(403).json({ message: 'Invalid refresh token.' });
	}
};
