module.exports = (sequelize, DataTypes) => {
	const Section = sequelize.define(
		'Section',
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
				allowNull: false,
				references: {
					model: 'Courses',
					key: 'id',
				},
			},
		},
		{
			timestamps: true,
		},
	);

	Section.associate = function (models) {
		Section.belongsTo(models.Course, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Section;
};
