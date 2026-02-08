'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Vocabulary extends Model {
    static associate(models) {
      Vocabulary.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
  }

  Vocabulary.init({
    vocab_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    word: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    definition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    translation: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    usage: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    pronunciation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    times_used: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Vocabulary',
    tableName: 'vocabulary',
    timestamps: false
  });

  return Vocabulary;
};