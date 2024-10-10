module.exports = (sequelize, DataTypes) => {
	const Review = sequelize.define(
		'Review',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			comment: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			rate: {
				type: DataTypes.INTEGER,
				allowNull: false,
				validate: {
					min: 1,
					max: 5,
				},
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
				references: {
					model: 'Courses',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
	);
	Review.associate = function (models) {
		Review.belongsTo(models.Student, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Review.belongsTo(models.Course, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Review;
};
