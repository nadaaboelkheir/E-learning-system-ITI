module.exports = (sequelize, DataTypes) => {
	const Marks = sequelize.define(
		'Marks',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			value: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			questionId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Questions',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
	);
	Marks.associate = function (models) {
		Marks.belongsTo(models.Question, {
			foreignKey: 'questionId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Marks;
};
