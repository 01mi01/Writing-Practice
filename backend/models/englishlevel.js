'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EnglishLevel extends Model {
    static associate(models) {
      EnglishLevel.hasMany(models.User, {
        foreignKey: 'english_level_id',
        as: 'users'
      });
    }
  }

  EnglishLevel.init({
    level_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    level_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'EnglishLevel',
    tableName: 'english_levels',
    timestamps: false
  });

  return EnglishLevel;
};