module.exports = (sequelize, DataTypes) => {
	const Teacher = sequelize.define(
		'Teacher',
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
			role: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'teacher',
			},
			phoneNumber: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					len: [10, 15],
					isNumeric: true,
				},
			},
			specialization: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			graduationYear: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isInt: true,
					min: 1900,
					max: new Date().getFullYear(),
				},
			},
			isEmailVerified: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			educationalQualification: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			walletId: {
				type: DataTypes.UUID,
				allowNull: true,
			},
			levelId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: 'Levels',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
		{ indexes: [{ fields: ['email'] }] },
	);
	Teacher.associate = function (models) {
		Teacher.hasMany(models.Course, {
			foreignKey: 'teacherId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'courses',
		});

		Teacher.hasOne(models.Wallet, {
			foreignKey: 'walletableId',
			constraints: false,
			scope: {
				walletableType: 'Teacher',
			},
			as: 'wallet',
		});

		Teacher.hasMany(models.Quiz, {
			foreignKey: 'teacherId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'quizzes',
		});

		Teacher.belongsTo(models.Level, {
			foreignKey: 'levelId',
			as: 'level',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};
	return Teacher;
};
