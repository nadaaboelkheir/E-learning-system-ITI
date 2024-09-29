const axiosInstance = require('../utils/axiosInstance');
const {
	PAYMOB_API_KEY,
	PAYMOB_INTEGRATION_ID_CARD,
	PAYMOB_FRAME_ONE,
} = require('../utils/env');

const authenticateWithPaymob = async () => {
	try {
		const response = await axiosInstance.post('/auth/tokens', {
			api_key: PAYMOB_API_KEY,
		});
		return response.data.token;
	} catch (error) {
		throw new Error('Failed to authenticate with Paymob');
	}
};

const createPaymobOrder = async (authToken, student, amount) => {
	try {
		const response = await axiosInstance.post('/ecommerce/orders', {
			auth_token: authToken,
			delivery_needed: 'false',
			amount_cents: amount * 100,
			currency: 'EGP',
			shipping_data: {
				first_name: student.firstName,
				last_name: student.lastName,
				email: student.email,
				phone_number: student.phoneNumber,
				country: 'EG',
				street: 'N/A',
				building: 'N/A',
				floor: 'N/A',
				apartment: 'N/A',
				postal_code: '00000',
			},
		});
		return response.data.id;
	} catch (error) {
		throw new Error('Failed to create an order with Paymob');
	}
};

const generatePaymentToken = async (authToken, orderId, student, amount) => {
	try {
		const response = await axiosInstance.post('/acceptance/payment_keys', {
			auth_token: authToken,
			amount_cents: amount * 100, // Convert amount to cent
			expiration: 3600,
			order_id: orderId,
			billing_data: {
				first_name: student.firstName,
				last_name: student.lastName,
				email: student.email,
				phone_number: student.phoneNumber,
				city: 'Cairo',
				country: 'EG',
				street: 'N/A',
				building: 'N/A',
				floor: 'N/A',
				apartment: 'N/A',
				postal_code: '00000',
			},
			currency: 'EGP',
			integration_id: PAYMOB_INTEGRATION_ID_CARD,
		});
		return response.data.token;
	} catch (error) {
		throw new Error('Failed to generate payment token');
	}
};

const getPaymentUrl = (paymentToken) => {
	return `${PAYMOB_FRAME_ONE}${paymentToken}`;
};

module.exports = {
	authenticateWithPaymob,
	createPaymobOrder,
	generatePaymentToken,
	getPaymentUrl,
};
