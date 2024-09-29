// require important modules
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

// create express app
const app = express();
const { PORT } = require('./utils/env');

// configure rate limiter
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // limit each IP to 100 requests per windowMs
});

// require database connection
const db = require('./models');

// Middleware to parse incoming requests
// configure app to use bodyParser (to receive post data from clients)
// this will let us get the data from a POST request
app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(cookieParser());
app.use(limiter); // apply rate limiter to all requests

// import routes
const authRoutes = require('./routers/auth.routes');
const adminRoutes = require('./routers/admin.routes');
const userRoutes = require('./routers/user.routes');
const courseRoutes = require('./routers/course.routes');
const levelRoutes = require('./routers/level.routes');
const quizRoutes = require('./routers/quiz.routes');

// use routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/level', levelRoutes);
app.use('/api/quiz', quizRoutes);

// Sync Sequelize models and start the server
db.sequelize
	.sync({ force: false })
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Unable to connect to the database:', err);
	});
