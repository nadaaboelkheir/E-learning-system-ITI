const express = require('express');
const {
	chargeStudentWallet,
	storeTransactionDetailsAndUpdateWallet,
	getStudentTransactions,
	getStudentWallet,
} = require('../controllers/wallet.controller');
const { protectRoute } = require('../middlewares/auth.mw');

const router = express.Router();

router.post('/charge', protectRoute,chargeStudentWallet);

router.post('/transaction', protectRoute,storeTransactionDetailsAndUpdateWallet);

router.get('/transactions/:studentId', getStudentTransactions);

router.get('/:studentId', getStudentWallet);

module.exports = router;
