module.exports = (sequelize, DataTypes) => {
	const Pdf = sequelize.define(
		'Pdf',
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
	Pdf.associate = function (models) {
		Pdf.belongsTo(models.Lesson, {
			foreignKey: 'lessonId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Pdf;
};
