'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Theme extends Model {
    static associate(models) {
      Theme.hasMany(models.UserPreference, {
        foreignKey: 'theme_id',
        as: 'userPreferences'
      });
    }
  }

  Theme.init({
    theme_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    theme_name: {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Theme',
    tableName: 'themes',
    timestamps: false
  });

  return Theme;
};