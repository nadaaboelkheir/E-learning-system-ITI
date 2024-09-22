// server.js
const express = require('express');
const app = express();
const db = require('./models');
const { PORT } = require('./utils/env');

// Middleware to parse incoming requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Sync Sequelize models and start the server
db.sequelize
	.sync()
	.then(() => {
		app.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error('Unable to connect to the database:', err);
	});
