const {
	DB_DATABASE,
	DB_USERNAME,
	DB_PASSWORD,
	DB_HOST,
} = require('../utils/env.js');
module.exports = {
	development: {
		username: DB_USERNAME || 'root',
		password: DB_PASSWORD || '',
		database: DB_DATABASE || 'e-learning',
		host: DB_HOST || '127.0.0.1',
		dialect: 'mysql',
	},
	test: {
		username: 'root',
		password: null,
		database: 'database_test',
		host: '127.0.0.1',
		dialect: 'mysql',
	},
	production: {
		username: 'root',
		password: null,
		database: 'database_production',
		host: '127.0.0.1',
		dialect: 'mysql',
	},
};
