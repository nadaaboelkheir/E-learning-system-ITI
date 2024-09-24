module.exports = (sequelize, DataTypes) => {
	const Video = sequelize.define(
		'Video',
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

			url: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isUrl: true,
				},
			},
			lessonId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Lessons',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
	);
	Video.associate = function (models) {
		Video.belongsTo(models.Lesson, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Video;
};
