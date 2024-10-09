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
			// courseId: {
			// 	type: DataTypes.UUID,
			// 	allowNull: true,
			// },
			parentLevelId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: {
					model: 'Levels',
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
			},
		},
		{
			timestamps: true,
		},
	);

	Level.associate = function (models) {
		// Self-referential association: A level can have many sub-levels
		Level.hasMany(models.Level, {
			as: 'subLevels',
			foreignKey: 'parentLevelId',
			onDelete: 'CASCADE',
			onUpdate: 'CASCADE',
		});

		Level.hasMany(models.Course, {
			foreignKey: 'levelId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
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
