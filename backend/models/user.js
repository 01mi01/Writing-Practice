'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.EnglishLevel, {
        foreignKey: 'english_level_id',
        as: 'englishLevel'
      });
      User.belongsTo(models.Certification, {
        foreignKey: 'certification_type_id',
        as: 'certification'
      });
    }
  }

  User.init({
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    english_level_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    certification_type_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    certification_score: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    current_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    longest_streak: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    last_activity_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: false
  });

  return User;
};