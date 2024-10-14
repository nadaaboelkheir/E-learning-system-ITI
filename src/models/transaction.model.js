module.exports = (sequelize, DataTypes) => {
	const Transaction = sequelize.define('Transaction', {
		id: {
			type: DataTypes.UUID,
			primaryKey: true,
			defaultValue: DataTypes.UUIDV4,
		},
		amount: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
		type: {
			type: DataTypes.ENUM('pending', 'completed', 'failed'),
			allowNull: false,
			defaultValue: 'pending',
		},
		currency: {
			type: DataTypes.STRING,
			allowNull: false,
			defaultValue: 'EGP',
		},
		walletId: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: 'Wallets',
				key: 'id',
			},
		},
		transactionDate: {
			type: DataTypes.DATE,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
	});

	Transaction.associate = function (models) {
		Transaction.belongsTo(models.Wallet, {
			foreignKey: 'walletId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Transaction;
};
