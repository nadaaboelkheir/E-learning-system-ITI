module.exports = (sequelize, DataTypes) => {
	const Level = sequelize.define(
		'Level',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			courseId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: 'Courses',
					key: 'id',
				},
			},

			teacherId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: 'Teachers',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
	);
	Level.associate = function (models) {
		Level.hasMany(models.Course, {
			foreignKey: 'levelId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'courses',
		});

		Level.hasMany(models.Student, {
			foreignKey: 'levelId',
			as: 'students',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Level.hasMany(models.Teacher, {
			foreignKey: 'levelId',
			as: 'teachers',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Level;
};
