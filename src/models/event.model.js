module.exports = (sequelize, DataTypes) => {
	const Event = sequelize.define('Event', {
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
		start: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		end: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		eventUrl: {
			type: DataTypes.STRING(255),
			allowNull: true,
		},
		adminId: {
			type: DataTypes.UUID,
			references: {
				model: 'Admins',
				key: 'id',
			},
			allowNull: false,
		},
	});

	Event.associate = function (models) {
		Event.belongsTo(models.Admin, {
			foreignKey: 'adminId',
			onUpdate: 'CASCADE',
			onDelete: 'CASCADE',
		});
	};

	return Event;
};
