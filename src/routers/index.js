const studentRoutes = require('./student.routes');
const adminRoutes = require('./admin.routes');
const teacherRoutes = require('./teacher.routes');
const userRoutes = require('./user.routes');
const routes = (app) => {
	app.use('/admin', adminRoutes);
	app.use('/teacher', teacherRoutes);
	app.use('/user', userRoutes);
    app.use('/student', studentRoutes);

};

module.exports = routes;
