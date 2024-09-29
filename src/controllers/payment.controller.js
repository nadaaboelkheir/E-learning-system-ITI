const AsyncHandler = require('express-async-handler');
const {
	Student,
	Wallet,
	Transaction,
	Course,
	Teacher,
	Admin,
} = require('../models');
const {
	authenticateWithPaymob,
	createPaymobOrder,
	generatePaymentToken,
	getPaymentUrl,
} = require('../services/payment.service');
const { parseISO } = require('date-fns');

exports.chargeStudentWallet = AsyncHandler(async (req, res) => {
	const { amount, studentId } = req.body;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});
	if (!wallet) {
		return res.status(404).json({ message: 'Wallet not found' });
	}

	const authToken = await authenticateWithPaymob();

	const orderId = await createPaymobOrder(authToken, student, amount);
	const transactionDetails = {
		amount: Number(amount),
		currency: 'EGP',
		walletId: wallet.id,
		type: 'pending',
		transactionDate: new Date(),
	};

	const pendingTransaction = await Transaction.create(transactionDetails);

	const paymentToken = await generatePaymentToken(
		authToken,
		orderId,
		student,
		amount,
	);

	const paymentUrl = getPaymentUrl(paymentToken);

	return res.json({
		payment_url: paymentUrl,
		transaction_id: pendingTransaction.id,
	});
});

exports.storeTransactionDetailsAndUpdateWallet = AsyncHandler(
	async (req, res) => {
		const { success, student_id, currency, amount_cents, updated_at } =
			req.body;
		const decodedUpdatedAt = decodeURIComponent(updated_at);
		const transactionDate = parseISO(decodedUpdatedAt);
		const student = await Student.findOne({ where: { id: student_id } });
		if (!student) {
			return res.status(404).json({ message: 'Student not found' });
		}

		const wallet = await Wallet.findOne({
			where: { id: student.walletId, walletableType: 'Student' },
		});
		if (!wallet) {
			return res.status(404).json({ message: 'Wallet not found' });
		}

		const transactionDetails = {
			amount: Number(amount_cents) / 100,
			currency: currency,
			walletId: wallet.id,
			type: success ? 'completed' : 'failed',
			transactionDate: transactionDate,
		};

		console.log('Transaction Details:', transactionDetails);

		const transaction = await Transaction.create(transactionDetails);
		console.log(transaction);

		if (success) {
			await wallet.update({
				balance: wallet.balance + Number(amount_cents) / 100,
			});
			return res.status(200).json({
				message: 'Transaction successful, wallet updated',
				transaction,
			});
		} else {
			return res.status(400).json({
				message: 'Transaction failed, wallet not updated',
				transaction,
			});
		}
	},
);
exports.getStudentTransactions = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const transactions = await Transaction.findAll({
		where: { walletId: student.walletId },
		order: [['transactionDate', 'DESC']],
	});

	if (transactions.length === 0) {
		return res
			.status(200)
			.json({ message: 'No transactions found for this student.' });
	}

	return res.status(200).json({ transactions: transactions });
});
exports.getStudentWallet = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});

	if (!wallet) {
		return res.status(404).json({ message: 'Wallet not found' });
	}

	const walletDetails = {
		id: wallet.id,
		balance: wallet.balance,
		walletableType: wallet.walletableType,
		createdAt: wallet.createdAt,
		updatedAt: wallet.updatedAt,
	};

	return res.status(200).json({ wallet: walletDetails });
});
exports.buyCourseWithWallet = AsyncHandler(async (req, res) => {
	const { studentId } = req.body;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});
	if (!wallet) {
		return res.status(404).json({ message: 'Wallet not found' });
	}

	const course = await Course.findOne({ where: { id: courseId } });
	if (!course) {
		return res.status(404).json({ message: 'Course not found' });
	}

	if (wallet.balance < 100) {
		return res
			.status(400)
			.json({ message: 'Insufficient wallet balance to buy the course' });
	}

	const updatedBalance = wallet.balance - course.price;
	await wallet.update({ balance: updatedBalance });

	const teacherShare = course.price * 0.8;
	const adminShare = course.price * 0.2;

	const teacher = await Teacher.findOne({ where: { id: course.teacherId } });
	const admin = await Admin.findOne({ where: { id: 1 } });

	if (!teacher || !admin) {
		return res.status(500).json({ message: 'Teacher or Admin not found' });
	}

	const teacherWallet = await Wallet.findOne({
		where: { walletableId: teacher.id, walletableType: 'Teacher' },
	});
	const adminWallet = await Wallet.findOne({
		where: { walletableId: admin.id, walletableType: 'Admin' },
	});

	if (!teacherWallet || !adminWallet) {
		return res
			.status(500)
			.json({ message: 'Teacher or Admin wallet not found' });
	}

	await teacherWallet.update({
		balance: teacherWallet.balance + teacherShare,
	});
	await adminWallet.update({ balance: adminWallet.balance + adminShare });

	const transactionDetails = {
		amount: course.price,
		currency: 'EGP',
		walletId: wallet.id,
		type: 'completed',
		transactionDate: new Date(),
	};

	const transaction = await Transaction.create(transactionDetails);

	return res.status(200).json({
		message: 'Course purchased successfully, wallet updated',
		transaction,
	});
});
exports.getStudentCourses = AsyncHandler(async (req, res) => {
	const { studentId } = req.params;

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'Student not found' });
	}

	const transactions = await Transaction.findAll({
		where: { walletId: student.walletId, type: 'completed' }, // Assuming completed transactions are purchases
		include: {
			model: Course, // Assuming Transaction includes Course or CourseId
			attributes: ['id', 'name', 'price', 'description'], // Include desired course attributes
		},
	});

	if (transactions.length === 0) {
		return res
			.status(200)
			.json({
				message: 'No courses found for this student',
				courses: [],
			});
	}

	const courses = transactions.map((transaction) => transaction.Course);

	return res.status(200).json({
		message: 'Student courses retrieved successfully',
		courses,
	});
});
exports.reviewCourseByStudent = AsyncHandler(async (req, res) => {});
exports.getReviewsByStudent = AsyncHandler(async (req, res) => {});
exports.takeQuiz = AsyncHandler(async (req, res) => {});
exports.getMarksForStudent = AsyncHandler(async (req, res) => {});
