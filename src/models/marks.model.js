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
			quizId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Quizzes',
					key: 'id',
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
		},
		{
			timestamps: true,
		},
	);
	Marks.associate = function (models) {
		Marks.belongsTo(models.Quiz, {
			foreignKey: 'quizId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
		Marks.belongsTo(models.Student, {
			foreignKey: 'studentId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Marks;
};
