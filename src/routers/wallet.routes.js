const express = require('express');
const {
	chargeStudentWallet,
	storeTransactionDetailsAndUpdateWallet,
	getStudentTransactions,
	getStudentWallet,
} = require('../controllers/payment.controller');

const router = express.Router();

router.post('/charge', chargeStudentWallet);

router.post('/transaction', storeTransactionDetailsAndUpdateWallet);

router.get('/transactions/:studentId', getStudentTransactions);

router.get('/:studentId', getStudentWallet);

module.exports = router;
