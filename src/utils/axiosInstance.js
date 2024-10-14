const axios = require('axios');

const axiosInstance = axios.create({
	baseURL: 'https://accept.paymob.com/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

module.exports = axiosInstance;
