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
		},
		{
			timestamps: true,
		},
	);
	Teacher.associate = function (models) {
		Teacher.hasMany(models.Course, {
			foreignKey: 'teacherId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Teacher.hasOne(models.Wallet, {
			foreignKey: 'walletableId',
			constraints: false,
			scope: {
				walletableType: 'Teacher',
			},
			as: 'wallet',
		});
	};
	return Teacher;
};
