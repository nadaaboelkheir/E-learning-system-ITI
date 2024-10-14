const AsyncHandler = require('express-async-handler');
const { Student, Wallet, Transaction } = require('../models');
const {
	authenticateWithPaymob,
	createPaymobOrder,
	generatePaymentToken,
	getPaymentUrl,
} = require('../services/payment.service');
const { parseISO } = require('date-fns');

exports.chargeStudentWallet = AsyncHandler(async (req, res) => {
	const { amount } = req.body;
	if (req.role !== 'student') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const studentId = req.student.id;

	if (!req.student.isEmailVerified) {
		return res.status(401).json({ error: 'البريد الالكتروني غير مفعل' });
	}

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});
	if (!wallet) {
		return res.status(404).json({ message: 'المحفظة غير موجودة' });
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
		const { success, currency, amount_cents, updated_at } = req.body;
		const decodedUpdatedAt = decodeURIComponent(updated_at);
		const transactionDate = parseISO(decodedUpdatedAt);
		if (req.role !== 'student') {
			return res
				.status(401)
				.json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
		}

		const studentId = req.student.id;

		if (!req.student.isEmailVerified) {
			return res
				.status(401)
				.json({ error: 'البريد الالكتروني غير مفعل' });
		}

		const student = await Student.findOne({ where: { id: studentId } });
		if (!student) {
			return res.status(404).json({ message: 'الطالب غير موجود' });
		}

		const wallet = await Wallet.findOne({
			where: { id: student.walletId, walletableType: 'Student' },
		});
		if (!wallet) {
			return res.status(404).json({ message: 'المحفظة غير موجودة' });
		}

		const transactionDetails = {
			amount: Number(amount_cents) / 100,
			currency: currency,
			walletId: wallet.id,
			type: success ? 'completed' : 'failed',
			transactionDate: transactionDate,
		};

		const transaction = await Transaction.create(transactionDetails);

		if (success) {
			await wallet.update({
				balance: wallet.balance + Number(amount_cents) / 100,
			});
			return res.status(200).json({
				message: 'العملية تمت بنجاح و تم تحديث المحفظة',
				transaction,
			});
		} else {
			return res.status(400).json({
				message: 'فشل في العملية، يرجى المحاولة مرة اخرى',
				transaction,
			});
		}
	},
);

exports.getStudentTransactions = AsyncHandler(async (req, res) => {
	if (req.role !== 'student') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const studentId = req.student.id;

	if (!req.student.isEmailVerified) {
		return res.status(401).json({ error: 'البريد الالكتروني غير مفعل' });
	}

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}

	const transactions = await Transaction.findAll({
		where: { walletId: student.walletId },
		order: [['transactionDate', 'DESC']],
	});

	if (transactions.length === 0) {
		return res.status(200).json({ message: 'لا توجد تحويلات لهذا الطالب' });
	}

	return res.status(200).json({ transactions: transactions });
});

exports.getStudentWallet = AsyncHandler(async (req, res) => {
	if (req.role !== 'student') {
		return res.status(401).json({ error: 'لا يمكنك الوصول لهذة الصفحة' });
	}

	const studentId = req.student.id;

	if (!req.student.isEmailVerified) {
		return res.status(401).json({ error: 'البريد الالكتروني غير مفعل' });
	}

	const student = await Student.findOne({ where: { id: studentId } });
	if (!student) {
		return res.status(404).json({ message: 'الطالب غير موجود' });
	}

	const wallet = await Wallet.findOne({
		where: { id: student.walletId, walletableType: 'Student' },
	});

	if (!wallet) {
		return res.status(404).json({ message: 'المحفظة غير موجودة' });
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
