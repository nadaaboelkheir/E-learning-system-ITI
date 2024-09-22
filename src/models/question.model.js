module.exports = (sequelize, DataTypes) => {
	const Question = sequelize.define(
		'Question',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			title: {
				type: DataTypes.STRING(250),
				allowNull: false,
			},
			mark: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			quizId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'Quiz', key: 'id' },
			},
		},
		{
			timestamps: true,
		},
	);

	Question.associate = function (models) {
		Question.belongsTo(models.Quiz, {
			foreignKey: 'quizId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Question.hasOne(models.Answer, {
			foreignKey: 'questionId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};
	

	return Question;
};
