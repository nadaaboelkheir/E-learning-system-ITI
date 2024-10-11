module.exports = (sequelize, DataTypes) => {
	const UserSessions = sequelize.define(
		'UserSessions',
		{
			userId: {
				type: DataTypes.UUID,
				allowNull: false,
				references: {
					model: 'Students',
					key: 'id',
				},
			},
			deviceInfo: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			active: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			timestamps: true,
		},
	);

	return UserSessions;
};
