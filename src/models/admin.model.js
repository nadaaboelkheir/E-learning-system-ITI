module.exports = (sequelize, DataTypes) => {
	const Admin = sequelize.define('Admin', {
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
			unique: true,
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
		
	},
		{
			timestamps: true,
		});
	Admin.associate = function (models) {
	};

	return Admin;
};
