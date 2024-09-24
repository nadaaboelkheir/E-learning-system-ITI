'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Disable foreign key checks for MySQL
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    // Get all table names from the database
    const tables = await queryInterface.showAllTables();

    // Drop each table
    for (const table of tables) {
      await queryInterface.dropTable(table);
    }

    // Re-enable foreign key checks
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },

  down: async (queryInterface, Sequelize) => {
    // The down method can be left empty or you can implement logic to recreate tables if necessary
  }
};
