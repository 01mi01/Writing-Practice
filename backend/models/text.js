'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Text extends Model {
    static associate(models) {
      Text.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      Text.belongsTo(models.TextType, {
        foreignKey: 'text_type_id',
        as: 'textType'
      });
    }
  }

  Text.init({
    text_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    text_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    word_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    spelling_errors: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    basic_connectors_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    advanced_connectors_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    vocab_words_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Text',
    tableName: 'texts',
    timestamps: false
  });

  return Text;
};