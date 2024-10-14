const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const { PORT } = require('./utils/env');
const { createAdminIfNotExists } = require('./configs/admin.config');
const cors = require('cors');
const db = require('./models');
const session = require('express-session');
const routes = require('./routers/index');
const app = express();

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 100,
});
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cookieParser());
app.use(limiter);
app.use(
	cors({
		origin: ['http://localhost:5173', 'http://localhost:3001'],
		credentials: true,
	}),
);
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		cookie: { maxAge: 300000 },
	}),
);
routes(app);

app.use((req, res, next) => {
	res.status(404).json({ message: 'Page not found.' });
});

// Global Error Handler
app.use((err, req, res, next) => {
	err.status = err.status || 500;

	res.status(err.status).json({
		status: err.status,
		errors: { error: err.toString() },
	});
});
// Global Error Handler
app.use((err, req, res, next) => {
	const statusCode = err.status || 500;
	// const environment = process.env.NODE_ENV || 'development';

	let customMessage = err.message || 'An unexpected error occurred.';
	// if (err instanceof ValidationError) {
	// 	customMessage = 'Invalid data provided';
	// }

	// const errorDetails =
	// 	environment === 'development'
	// 		? {
	// 				stack: err.stack,
	// 				errors: err.errors || null,
	// 			}
	// 		: {};

	// if (environment === 'development') {
	// 	console.error(err.stack);
	// } else {
	// 	console.error(`Error: ${customMessage}`);
	// }

	res.status(statusCode).json({
		status: statusCode,
		message: customMessage,
		// ...(environment === 'development' ? errorDetails : {}),
		// path: req.originalUrl,
	});
});

db.sequelize
	.sync({ force: false })
	.then(async () => {
		await createAdminIfNotExists();
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Unable to connect to the database:', err);
	});
