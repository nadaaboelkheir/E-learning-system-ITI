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
				unique: true,
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
			level: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			nationalID: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
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
	);
	Student.associate = function (models) {
		Student.hasMany(models.Course, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Student.hasMany(models.Transaction, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Student.hasMany(models.Review, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Student.belongsTo(models.Wallet, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Student.hasMany(models.Subscription, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		// Student.hasMany(models.Marks, { foreignKey:'studentId' });
	};

	return Student;
};
