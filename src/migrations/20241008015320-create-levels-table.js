module.exports = {
	up: async (queryInterface, Sequelize) => {
		await queryInterface.createTable('Levels', {
			id: {
				allowNull: false,
				primaryKey: true,
				type: Sequelize.UUID,
				defaultValue: Sequelize.UUIDV4,
			},
			title: {
				type: Sequelize.STRING,
				allowNull: false,
			},
			courseId: {
				type: Sequelize.UUID,
				allowNull: true,
			},
			parentLevelId: {
				type: Sequelize.UUID,
				allowNull: true,
				references: {
					model: 'Levels', 
					key: 'id',
				},
				onUpdate: 'CASCADE',
				onDelete: 'SET NULL',
			},
			createdAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
			updatedAt: {
				allowNull: false,
				type: Sequelize.DATE,
			},
		});
	},
	down: async (queryInterface, Sequelize) => {
		await queryInterface.dropTable('Levels');
	},
};
