module.exports = (sequelize, DataTypes) => {
	const Course = sequelize.define(
		'Course',
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
			image: {
				type: DataTypes.STRING,
			},
			levelId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Levels',
					key: 'id',
				},
			},
			courseVerify: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			teacherId: {
				type: DataTypes.UUID,
				references: {
					model: 'Teachers',
					key: 'id',
				},
			},
			price: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			discountedPrice: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
		},
		{
			timestamps: true,
		},
	);

	Course.associate = function (models) {
		Course.belongsTo(models.Level, {
			foreignKey: 'levelId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'level',
		});

		Course.belongsTo(models.Teacher, {
			foreignKey: 'teacherId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'teacher',
		});

		Course.hasMany(models.Section, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'sections',
		});

		Course.hasMany(models.Review, {
			foreignKey: 'courseId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
			as: 'reviews',
		});

		Course.belongsToMany(models.Student, {
			through: models.Enrollment,
			foreignKey: 'courseId',
			as: 'students',
		});

		// Course.hasMany(models.Quiz, {
		// 	foreignKey: 'courseId',
		// 	onUpdate: 'CASCADE',
		// 	onDelete: 'CASCADE',
		// 	as: 'quizzes',
		// });
	};

	return Course;
};
