module.exports = (sequelize, DataTypes) => {
	const Answer = sequelize.define(
		'Answer',
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
			isCorrect: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
			},
			questionId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'Questions', key: 'id' },
               
			},
		},
		{
			timestamps: true,
		},
	);

	Answer.associate = function (models) {
		Answer.belongsTo(models.Question, { foreignKey: 'questionId',onUpdate :"CASCADE",onDelete :"CASCADE"  });
	};

	return Answer;
};
