module.exports = (sequelize, DataTypes) => {
	const AboutItems = sequelize.define(
		'AboutItems',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			primary_item: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			secondary: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			aboutId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'About', key: 'id' },
			},
		},
		{
			timestamps: true,
		},
	);

	AboutItems.associate = function (models) {
		AboutItems.belongsTo(models.About, {
			foreignKey: 'aboutId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return AboutItems;
};
