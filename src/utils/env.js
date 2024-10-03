/* eslint-disable no-undef */
require('dotenv').config();

module.exports = {
	DB_USERNAME: process.env.DB_USERNAME,
	DB_DATABASE: process.env.DB_DATABASE,
	DB_PASSWORD: process.env.DB_PASSWORD,
	DB_HOST: process.env.DB_HOST,
	PORT: process.env.PORT,
	DB_PORT: process.env.DB_PORT,

	PAYMOB_API_KEY: process.env.PAYMOB_API_KEY,
	PAYMOB_INTEGRATION_ID_CARD : process.env.PAYMOB_INTEGRATION_ID_CARD,
	PAYMOB_INTEGRATION_ID_WALLET: process.env.PAYMOB_INTEGRATION_ID_WALLET,
	PAYMOB_FRAME_ONE: process.env.PAYMOB_FRAME_ONE,
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
};
