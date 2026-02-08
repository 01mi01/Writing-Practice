'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('colors', {
      color_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      color_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('colors');
  }
};