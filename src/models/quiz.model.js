module.exports = (sequelize, DataTypes) => {
	const Quiz = sequelize.define(
		'Quiz',
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
			Duration: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lessonId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'Lessons', key: 'id' },
			},
		},
		{
			timestamps: true,
		},
	);

	Quiz.associate = function (models) {
		Quiz.belongsTo(models.Lesson, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Quiz.hasMany(models.Question, {
			foreignKey: 'quizId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Quiz;
};
