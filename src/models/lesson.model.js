module.exports = (sequelize, DataTypes) => {
	const Lesson = sequelize.define(
		'Lesson',
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
			description: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			courseId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
		},
		{
			timestamps: true,
		},
	);
	Lesson.associate = function (models) {
		Lesson.belongsTo(models.Course, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Lesson.hasMany(models.Pdf, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Lesson.hasMany(models.Quiz, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Lesson.hasMany(models.Video, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Lesson.hasMany(models.Review, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Lesson;
};
