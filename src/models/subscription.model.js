module.exports = (sequelize, DataTypes) => {
	const Subscription = sequelize.define('Subscription', {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		startDate: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				isAfterToday(value) {
					if (new Date(value) <= new Date()) {
						throw new Error('Start date must be in the future.');
					}
				},
			},
		},
		endDate: {
			type: DataTypes.DATE,
			allowNull: false,
			validate: {
				isAfterStart(value) {
					if (new Date(value) <= new Date(this.startDate)) {
						throw new Error('End date must be after start date.');
					}
				},
			},
		},
		subscriptionStatus: {
			type: DataTypes.ENUM('active', 'expired'),
			defaultValue: 'active',
		},
		paymentStatus: {
			type: DataTypes.ENUM('paid', 'unpaid'),
			defaultValue: 'unpaid',
		},
		studentId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'Students',
				key: 'id',
			},
		},
		courseId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'Courses',
				key: 'id',
			},
		},
	});

	Subscription.associate = function (models) {
		Subscription.belongsTo(models.Student, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Subscription.belongsTo(models.Course, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Subscription;
};
