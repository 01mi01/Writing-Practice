'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('texts', {
      text_id: {
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
      text_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'text_types',
          key: 'type_id'
        }
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      word_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      spelling_errors: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      basic_connectors_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      advanced_connectors_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      vocab_words_used: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('texts');
  }
};