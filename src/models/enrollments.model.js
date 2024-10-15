module.exports = (sequelize, DataTypes) => {
	const Enrollment = sequelize.define(
		'Enrollment',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
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
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			enrollDate: {
				type: DataTypes.DATE,
				allowNull: false,
				defaultValue: DataTypes.NOW,
			},
		},
		{
			timestamps: true,
		},
	);

	Enrollment.associate = function (models) {
		Enrollment.belongsTo(models.Student, {
			foreignKey: 'studentId',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		Enrollment.belongsTo(models.Course, {
			foreignKey: 'courseId',
		});
	};

	return Enrollment;
};
