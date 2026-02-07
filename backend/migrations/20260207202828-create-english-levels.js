'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('english_levels', {
      level_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      level_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('english_levels');
  }
};