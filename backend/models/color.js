'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Color extends Model {
    static associate(models) {
      Color.hasMany(models.UserPreference, {
        foreignKey: 'color_id',
        as: 'userPreferences'
      });
    }
  }

  Color.init({
    color_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    color_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Color',
    tableName: 'colors',
    timestamps: false
  });

  return Color;
};