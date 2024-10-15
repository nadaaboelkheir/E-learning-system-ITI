module.exports = (sequelize, DataTypes) => {
	const Student = sequelize.define(
		'Student',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isEmail: true,
				},
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			picture: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			levelId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Levels',
					key: 'id',
				},
			},
			nationalID: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [10, 15],
					isNumeric: true,
				},
			},
			parentPhoneNumber: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [10, 15],
					isNumeric: true,
				},
			},
			role: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'student',
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			isEmailVerified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			walletId: {
				type: DataTypes.UUID,
				allowNull: true,
			},
		},
		{
			timestamps: true,
		},
		{ indexes: [{ fields: ['email', 'nationalID'] }] },
	);

	Student.associate = function (models) {
		Student.belongsToMany(models.Course, {
			through: models.Enrollment,
			foreignKey: 'studentId',
			as: 'courses',
			constraints: false,
		});

		Student.hasMany(models.Transaction, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			constraints: false,
		});

		Student.hasMany(models.Review, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			constraints: false,
		});

		// Student.hasMany(models.Quiz, {
		// 	foreignKey: 'studentId',
		// 	onUpdate: 'CASCADE',
		// 	onDelete: 'CASCADE',
		// 	as: 'quizzes',
		// });

		Student.hasOne(models.Wallet, {
			foreignKey: 'walletableId',
			constraints: false,
			scope: {
				walletableType: 'Student',
			},
			as: 'wallet',
		});

		Student.belongsTo(models.Level, {
			foreignKey: 'levelId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'level',
		});

		Student.hasMany(models.UserSessions, {
			foreignKey: 'userId',
			as: 'sessions',
		});
	};

	return Student;
};
