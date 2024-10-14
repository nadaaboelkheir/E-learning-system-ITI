module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define(
		'Admin',
		{
			id: {
				type: DataTypes.UUID,
				primaryKey: true,
				defaultValue: DataTypes.UUIDV4,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				validate: {
					isEmail: true,
				},
			},
			password: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			picture: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			role: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'admin',
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			walletId: {
				type: DataTypes.UUID,
				allowNull: true,
			},
		},
		{
			timestamps: true,
		},
		{ indexes: [{ fields: ['email'] }] },
	);

	Admin.associate = function (models) {
		Admin.hasOne(models.Wallet, {
			foreignKey: 'walletableId',
			constraints: false,
			scope: {
				walletableType: 'Admin',
			},
			as: 'wallet',
		});

		Admin.hasMany(models.Event, {
			foreignKey: 'adminId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Admin;
};
