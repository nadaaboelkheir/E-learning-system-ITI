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
			walletableId: {
				type: DataTypes.UUID,
				allowNull: false,
			},
			walletableType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			timestamps: true,
		},
	);

	Wallet.associate = function (models) {
		Wallet.belongsTo(models.Student, {
			foreignKey: 'walletableId',
			constraints: false,
			as: 'studentWallet',  
		});
		Wallet.belongsTo(models.Teacher, {
			foreignKey: 'walletableId',
			constraints: false,
			as: 'teacherWallet',  
		});
		Wallet.belongsTo(models.Admin, {
			foreignKey: 'walletableId',
			constraints: false,
			as: 'adminWallet', 
		});
	};

	return Wallet;
};
