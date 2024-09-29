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
		});
	};

	return Level;
};
