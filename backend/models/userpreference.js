'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class UserPreference extends Model {
    static associate(models) {
      UserPreference.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      UserPreference.belongsTo(models.Theme, {
        foreignKey: 'theme_id',
        as: 'theme'
      });
      UserPreference.belongsTo(models.Color, {
        foreignKey: 'color_id',
        as: 'color'
      });
    }
  }

  UserPreference.init({
    preference_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      unique: true,
      allowNull: false
    },
    theme_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    color_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'UserPreference',
    tableName: 'user_preferences',
    timestamps: false
  });

  return UserPreference;
};