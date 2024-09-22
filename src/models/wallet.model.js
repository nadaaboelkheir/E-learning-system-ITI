module.exports = (sequelize, DataTypes) => {
	const Wallet = sequelize.define(
		'Wallet',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			balance: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0.0,
			},
			studentID: {
				type: DataTypes.UUID,
				allowNull: false,
				references: { model: 'Students', key: 'id' },
			},
		},
		{
			timestamps: true,
		},
	);
	Wallet.associate = function (models) {
		Wallet.belongsTo(models.Student, {
			foreignKey: 'studentID',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	Wallet.hasMany(models.Transaction, {
		foreignKey: 'walletId',
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	});

	return Wallet;
};
