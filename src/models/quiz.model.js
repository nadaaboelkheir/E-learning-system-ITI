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
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			sectionId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'Sections', key: 'id' },
			},

			teacherId: {
				type: DataTypes.UUID,
				allowNull: true,
				references: { model: 'Teachers', key: 'id' },
			},
		},
		{
			timestamps: true,
		},
	);

	Quiz.associate = function (models) {
		Quiz.belongsTo(models.Section, {
			foreignKey: 'sectionId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Quiz.belongsTo(models.Teacher, {
			foreignKey: 'teacherId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'teacher',
		});

		Quiz.hasMany(models.Question, {
			foreignKey: 'quizId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Quiz;
};
