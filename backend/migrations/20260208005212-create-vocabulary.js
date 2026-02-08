'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('vocabulary', {
      vocab_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'user_id'
        },
        onDelete: 'CASCADE'
      },
      word: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      definition: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      translation: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      usage: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      pronunciation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      times_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('vocabulary');
  }
};