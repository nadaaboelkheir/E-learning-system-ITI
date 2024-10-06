'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
	up: async (queryInterface, Sequelize) => {
		// Check if the column already exists
		const tableInfo = await queryInterface.describeTable('Teachers');

		if (!tableInfo.levelId) {
			// Only add if the column doesn't exist
			await queryInterface.addColumn('Teachers', 'levelId', {
				type: Sequelize.UUID,
				references: {
					model: 'Levels', // Name of the Levels table
					key: 'id', // Primary key in Levels table
				},
				onUpdate: 'CASCADE',
				onDelete: 'CASCADE',
				allowNull: true,
			});
		}
	},

	down: async (queryInterface, Sequelize) => {
		await queryInterface.removeColumn('Teachers', 'levelId');
	},
};
