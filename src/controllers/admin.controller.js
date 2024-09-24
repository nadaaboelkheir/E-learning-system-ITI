const { Admin } = require('../models');
const bcrypt = require('bcryptjs');

const adminSignup = async (req, res) => {
	try {
		const { name, email, password } = req.body;

		// Check if the admin email already exists
		const existingAdmin = await Admin.findOne({ where: { email } });
		if (existingAdmin) {
			return res.status(400).json({ message: 'Email already in use.' });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Save admin to the database after email is sent
		const admin = await Admin.create({
			name,
			email,
			password: hashedPassword,
		});

		res.status(201).json({
			message: 'Signup successful.',
			data: admin,
		});
	} catch (error) {
		console.error('Error in signup:', error);
		res.status(500).json({ error: error.message });
	}
};

module.exports = { adminSignup };
