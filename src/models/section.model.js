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
				allowNull: true,
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
			as: 'course',
		});

		Section.hasMany(models.Quiz, {
			foreignKey: 'sectionId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});

		Section.hasMany(models.Lesson, {
			foreignKey: 'sectionId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'lessons',
		});
	};

	return Section;
};
