module.exports = (sequelize, DataTypes) => {
	const About = sequelize.define(
		'About',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			section: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			title: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			timestamps: true,
		},
	);

	About.associate = function (models) {
		About.hasMany(models.AboutItems, {
			foreignKey: 'aboutId',
			as: 'items',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return About;
};
