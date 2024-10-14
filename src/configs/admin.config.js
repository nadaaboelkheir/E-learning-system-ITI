const { Admin, Wallet } = require('../models');
const bcrypt = require('bcryptjs');
const AsyncHandler = require('express-async-handler');

exports.createAdminIfNotExists = AsyncHandler(async (req, res) => {
	const existingAdmin = await Admin.findOne({
		where: { email: 'admin@gmail.com' },
	});
	if (!existingAdmin) {
		const hashedPassword = await bcrypt.hash('admin123@', 10);

		const admin = await Admin.create({
			name: 'admin',
			email: 'admin@gmail.com',
			password: hashedPassword,
		});
		const wallet = await Wallet.create({
			balance: 0,
			walletableId: admin.id,
			walletableType: 'Admin',
		});

		await admin.update({ walletId: wallet.id });
		console.log('Admin user created');
	} else {
		console.log('Admin user already exists');
	}
});
