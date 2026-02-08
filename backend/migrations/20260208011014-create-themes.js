'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('themes', {
      theme_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      theme_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('themes');
  }
};